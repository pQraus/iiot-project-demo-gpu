# Cluster Administration System App

This app provides the argo applicationset, repo secret and the docker registry secret for your project

After deploying you must run:
```console
kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "container-registry"}]}'
kubeseal -f inital-secrets/registry-secret.yaml     # output to a file in argo dir
kubeseal -f inital-secrets/repo-secret.yaml         # output to a file in argo dir
```
