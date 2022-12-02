# Setup IIoT-Box
1. Create a project repo (local and on github) from this base (repo), run copier in the new project dir / repo: 
    ```console
    copier https://github.com/SchulzSystemtechnik/iiot-base-box.git .
    ```
    fill out the configuration:
    - for argo the ssh url to the project repo is needed
    - in addition a deploy key is required (argo needs access to th repo): 
        ```console
        ssh-keygen -t ed25519
        ```
        add the public key in github and paste the private key in the copier dialog
    - the box needs access to docker: create a access-token for a machine user and paste the token in the dialog
    - to connect the box with teleport an join-token is needed: 
        ```
        tsh login --auth github --proxy=proxy.teleport.schulzcontrolcenter.com:443
        tctl tokens add --type=app,kube # create a join token
        ```
2. Create the initial machine config (all patches are templated at this time)
    ```console
    cd <project-repo>
    machine/generate_machine_config.sh
    ```
    --> you will see the created machine config in the machine dir, the config will not committed to the repo (secrets)
3. Commit an push the files to the (github) repo
4. Initialize the box:
    - plug in the "DANGER" USB-stick which contains the *talos.iso*
    - startup and boot from the stick
    - connect the box with the internet (you should know the ip address of the box)
    
    At this point talos is running in the RAM and the created machine config can be applied
5. Apply the machine config
    ```console
    cd <project-repo>
    talosctl apply-config --insecure --nodes <box-ip-address> -f machine/controlplane.yaml
    ```
    The box will restart some times, after this the box should be connected to teleport and argo should manage the system apps.

    If not, use the created `machine/talosconfig` to connect to the device.
    (merge config, switch context)
6. Connect with Talos or Kubernetes (see other docs)
7. Rewrite the `talosconfig_teleport`:
    - ```console
        cd <project-repo>/machine
        ```
    - open the generated `talosconfig` file and copy the value of the `ca` key
    - paste the value into `talosconfig_teleport` (`ca: ` field) 
8. Patch the service accout for access to the docker registry (wait until the k8s cluster is ready)
    ```console
    kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "container-registry"}]}'
    ```
9. Seal the initial secrets from the app creator system app (wait until the k8s cluster is ready and the sealed secret system app is installed)
    ```console
    cd <project-repo>
    kubeseal -f system_apps/app-creator/initial-secrets/repo-secret.yaml -o yaml > system_apps/app-creator/argo/repo-secret-sealed.yaml
    kubeseal -f system_apps/app-creator/initial-secrets/registry-secret.yaml -o yaml > system_apps/app-creator/argo/registry-secret-sealed.yaml
    ```
10. Patch the default service account to get access to the docker registry 
11. Commit and push the `talosconfig_teleport` and the sealed secrets into the repository

