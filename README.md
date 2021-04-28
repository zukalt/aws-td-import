# Generate terraform files AWS ECS Task Definitions easily
 MIT License 
 ## Prequisites
Make sure you have those installed and configured
* node/npm
* terraform
* aws CLI 

 ## TLDR;

    ~ git clone https://github.com/zukalt/aws-td-import.git
    ~ cd aws-td-import
    ~ npm i -g .

    ~ mkdir ../my-task-defs-to-update
    ~ cd ../my-task-defs-to-update
    ~ aws-td-import -h
        Usage: aws-td-import [options]

        Options:
            --version             Show version number                        [boolean]
        -r, --region              AWS Region                    [default: "us-east-1"]
        -p, --prefix              Task definitions family prefix
        -f, --force, --overwrite  Overwrite existing files                   [boolean]
        -h, --help                Show help                                  [boolean]

    ~ aws-td-import --region us-east-1 --prefix staging

        Creating file container-defs/....json
        Creating file _....tf
        Creating file import.cmd
        Creating file main.tf
    
    #
    # MAKE SURE GENERATED FILES ARE GOOD
    # Terraform initial commands to init, import and verification (plan) are in import.cmd
    #  

    ~ source import.cmd
    
If `terraform plan` commands tells you are synced with existing infrastructure then you are lucky. 

    ~ terraform plan
        aws_ecs_task_definition.staging-...-td: Refreshing state... [id=staging-..]

        No changes. Infrastructure is up-to-date.

        This means that Terraform did not detect any differences between your configuration and the remote system(s). As a result, there are no actions to take.


Go ahead make your changes and `terraform apply`
    