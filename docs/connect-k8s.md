# Connect with k8s
(on your dev machine)

Requirements:
- Teleport cli-tool (`tsh`)
- Kubectl cli-tool

## Login to a k8s cluster
1. Login to teleport
    ```console
    tsh login --auth github --proxy=proxy.teleport.schulzcontrolcenter.com:443
    ```
2. List the available clusters 
    ```console
    tsh kube ls
    ```
3. Login to a kubernetes cluster
    ```console
    tsh kube login <cluster-name>
    ```
4. In sometimes you must manually switch to the right k8s-context
    ```console
    kubectl config get-contexts
    kubectl config use-context <context-name>
    ```

## Connect to a ArgoCD UI
1. login to a k8s cluster
2. forward the port of argoCD server:
    ```console
    kubectl port-forward --address "0.0.0.0" -n argocd services/argocd-server <custom-port>:443
    ```
