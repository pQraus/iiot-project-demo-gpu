# Connect with the Talos-API

## Steps to connect via Teleport
Requirements:
- `talosctl` cli-tool
- Teleport cli-tool (`tsh`)
- The project repo (`git clone ...`)

1. Add the `talosconfig_teleport` of the project to your `talosconfig`
    ```console
    cd <project-repo>
    talosctl config merge machine/talosconfig_teleport
    ```
    This step must be executed only once for each project!
2. Switch to the right context 
    ```console
    talosctl config contexts #list the available contexts
    talosctl config context <context-name> # switch to the project context
    ```
3. Login to teleport
    ```console
    tsh login --auth github --proxy=proxy.teleport.schulzcontrolcenter.com:443
    ```
4. Login to the talos-api application (teleport app)
    ```console
    tsh app ls # list the available apps
    tsh app login <app-name>
    ```
5. Proxy a local port to the app. The port 50000 is the standard for the talosctl tool.
    ```console
    tsh proxy app talos-api-demo-pqraus -p 50000
    ```
    Now you proxy the port 50000 of your dev machine to teleport. When you are finished the work you can close / exit the command.
6. Run your `talosctl` commands in a new window

## Steps to connect via direct access
Requirements:
- `talosctl` cli-tool
- Teleport cli-tool (`tsh`, `tctl`)
- The project repo (`git clone ...`)
- direct network access to the talos machine

1. Login to teleport
    ```console
    tsh login --auth github --proxy=proxy.teleport.schulzcontrolcenter.com:443
    ```
2. Create temporary certs for your verification against the talos machine
    ```console
    cd <some-tmp-dir>
    tctl auth sign --out local-access --format tls --user <your-teleport-username> --ttl 8
    ```
3. Create an entry into the talosconfig with the created certs
    ```console
    talosctl config add <project-name>-local --crt local-access.crt --key local-access.key
    ```
4. Modify the created entry in your talosconfig
    ```console
    vim ~/.talos/config # or open this file with any other editor
    ```
    Search the created entry (e.g. by searching for *project-name-local*)
    - add the `ca` key into the created entry and paste the value from the `ca` field from `<project-repo>/machine/talosconfig_teleport`
    - add the `endpoint` key in the entry with the value `<ip-address of the device>:51001` (e.g `192.168.42.42:51001`)
    - add the `nodes` key into the created entry with the value `<ip-address of the device>`

    The modified entry (in `.talos/config`) should look similar to this example:
    ```yaml
    example-device-local:
        endpoints:
            - 192.168.45.2:51001
        nodes:
            - 192.168.45.2
        ca: LS0tLS1CRUdJ..... # copied from <project-repo>/machine/talosconfig_teleport
        crt: LS0tLS1CRUd..... # shorted
        key: LS0tLS1CFHE..... # shorted
    ```
5. Switch the `talosctl` context to the created context
    ```console
    talosctl config context <project-name>-local
    ```
Now it should be possible to communicate with the box via `talosctl`.


