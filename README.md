# Generate terraform files AWS ECS Task Definitions easily
 MIT License 
 ## Prequisites
Make sure you have those installed and configred
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
    
If `terraform plan` commands tells you are sync with remote then you are lucky. 
Go ahead make your changes and `terraform apply`
    