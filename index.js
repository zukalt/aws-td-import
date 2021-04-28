#!/usr/bin/env node
const ECS = require('aws-sdk/clients/ecs')
const fs = require('fs')
const argv = require('yargs/yargs')(process.argv.slice(2))
    .usage('Usage: $0 [options]')
    .alias('r', 'region').nargs('r', 1).default('r', 'us-east-1').describe('r', 'AWS Region')
    .alias('p', 'prefix').nargs('p', 1).describe('p', 'Task definitions family prefix')
    .alias('f', 'force').alias('f', 'overwrite').boolean('f').describe('f', 'Overwrite existing files')
    .help('h')
    .alias('h', 'help')
    .argv;


const writeToFileConditionally = (fileName, body, overwrite) => {
    const exists = fs.existsSync(fileName)
    if (!exists || overwrite) {
        console.log(`${exists ? 'Overwriting' : 'Creating'} file ${fileName}`)
        fs.writeFileSync(fileName, body)
    }
    else {
        console.log(`Skipping file update: ${fileName}`)
    }
}

const importAndGenerate = async ({ region, prefix: familyPrefix, overwrite }) => {

    const ecs = new ECS({
        region
    });


    const { families } = await ecs.listTaskDefinitionFamilies({
        familyPrefix
    }).promise();

    if (!families.length) {
        console.log(`No task definitions found with prefix: "${familyPrefix}" in region: "${region}"`)
        return;
    }

    const taskDefinitions = await Promise.all(
        families.map(family => ecs.describeTaskDefinition({ taskDefinition: family }).promise()
            .then(({ taskDefinition }) => taskDefinition).catch(() => ({})))
    )

    if (!fs.existsSync('container-defs')) {
        fs.mkdirSync('container-defs')
    }

    const importCommands = ['terraform init']

    taskDefinitions.filter(td => td.taskDefinitionArn).forEach(td => {
        const fileName = `_${td.family}-td.tf`
        const fileNameJson = `container-defs/${td.family}.json`

        writeToFileConditionally(fileNameJson, JSON.stringify(td.containerDefinitions, ' ', 4), overwrite)
        writeToFileConditionally(fileName,
            [
                `resource "aws_ecs_task_definition" "${td.family}-td" {`,
                `    family = "${td.family}"`,
                `    container_definitions = file("${fileNameJson}")`,
                `    cpu = ${td.cpu}`,
                `    memory = ${td.memory}`,
                `    network_mode = "${td.networkMode}"`,
                `    requires_compatibilities = ${JSON.stringify(td.requiresCompatibilities)}`,
                `    execution_role_arn = "${td.executionRoleArn}"`,
                `    task_role_arn = "${td.taskRoleArn}"`,
                `    tags = ${JSON.stringify(td.tags || {})}`,

                `}`
            ].join('\n')
            , overwrite);

        importCommands.push(`terraform import aws_ecs_task_definition.${td.family}-td ${td.taskDefinitionArn}`)
    })
    importCommands.push(`terraform plan`)
    writeToFileConditionally('import.cmd', importCommands.join('\n'), true); // always overwrite

    writeToFileConditionally(
        'main.tf',
        [
            `terraform {`,
            `  required_providers {`,
            `    aws = {`,
            `      source  = "hashicorp/aws"`,
            `      version = "~> 3.27"`,
            `    }`,
            `  }`,
            `  required_version = ">= 0.14.9"`,
            `}`,
            `provider "aws" {`,
            `  profile = "default"`,
            `  region  = "${region}"`,
            `}`
        ].join('\n'),
        false) // never overwrite

}

importAndGenerate(argv).catch(e => {
    console.error(e.message)
});
