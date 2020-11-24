# Deploying the lounge server in production
1. SSH into the GCP virtual machine
2. Pull the most recent changes from master
    - `git checkout master`
    - `git pull`
3. Install dependencies
    - `npm i`
4. Run predeploy script
    - `npm run deploy`
5. Check if the server is running
    - `forever list`