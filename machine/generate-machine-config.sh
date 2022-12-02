#!/bin/bash
# This script create the machine configuration for a talos machine. It uses a container with talosctl for the creation.

set -e

COPIER_ANSWERS=./.copier-answers.yml
SCRIPT_PATH=$0

main() {

  # change to repo root
  cd $(dirname $SCRIPT_PATH)/..

  echo "detected patches:"
  find ./machine/**/ ./system-apps/*/machine-patches -maxdepth 1 -type f -name '*.yaml'
  
  # create argument list for talosctl: -p @patch_file1 -p @patch_file2 ... 
  # it's a workaround because you can't point to a whole dir
  PATCH_ARGUMENTS=$(find ./machine/**/ ./system-apps/*/machine-patches -maxdepth 1 -type f -name '*.yaml' -exec echo -n "--config-patch @{} " \;)
  # it's necessary to add a cluster name and an endpoint to `gen config` but these names will be overridden from patch files
  docker run --rm -v $(pwd):/repo -w /repo schulzsystemtechnik/iiot-misc-talosctl:1.2.0 gen config --output-dir ./machine $PATCH_ARGUMENTS CLUSTER_NAME https://ENDPOINT:6443 --with-examples=false --with-docs=false
  docker run --rm -v $(pwd):/repo -w /repo schulzsystemtechnik/iiot-misc-talosctl:1.2.0 validate -m metal -c ./machine/controlplane.yaml
}

main
