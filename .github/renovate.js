/* Renovate config for an update with copier
 *
 * This bot will only observed copier-answers file from copier and run copier update if
 * there is a new version.
 *
 * Copier will run in a sidecar container (the identical docker socket will be used).
 * Because you can't mount any new dirs to the *docker run ...* command in the action 
 * copier runs in a sidecar container (binarySource: docker)
 * 
 * Requirements: 
 *  - GitHub PAT for with read access (scope repo)
 * 
 * Develop renovate locally:
 * 
 * docker run --rm -v $(pwd)/'{{ '\''renovate'\'' }}'/renovate-config.js:/usr/src/app/config.js 
 * -e "RENOVATE_TOKEN=GITHUB_TOKEN" -e "LOG_LEVEL=debug" -it -v /var/run/docker.sock:/var/run/docker.sock 
 * --user=1000:998 renovate/renovate
 * 
 */


 module.exports = {
    branchPrefix: 'renovate/',
    username: 'renovate-bot',           // TODO change to an existing user
    gitAuthor: 'Renovate Bot <bot@renovateapp.com>',
onboarding: false,                      // no onboarding PR
    requireConfig: 'optional',          // renovate.json is optional
    platform: 'github',
    includeForks: false,
    extends: ['config:base',            // use the base config: https://docs.renovatebot.com/presets-config/#configbase
        ':disableDependencyDashboard'   // TODO remove after new user exist
    ],
    // ignorePresets: [':prHourlyLimit2'] // WIP maybe necessary
    ignorePresets: [':dependencyDashboard'],
    // dryRun: 'full',                  // lookup: find only dependencies

    hostRules: [
        {
            matchHost: 'https://github.com', // TODO add schulz/systemtechnik
            token: process.env.RENOVATE_TOKEN
        }
    ],

    enabledManagers: ['regex'],    
    regexManagers: [
        {
            fileMatch: ['^\\..*-answers\\.yml'],    // TODO .(yml|yaml)??
            datasourceTemplate: 'github-tags',      // this datasource displays the release notes in the PR
            matchStrings: [           
                '_commit: (?<currentValue>.*?)\\n_src_path: (?<registryUrl>[a-z]*?:\\/\\/.*?)\\/(?<depName>.*?)(.git|)\\n'
            ], // you can only provide one string!
            // currentValue: current version number (e.g. 1.1.2)
            // depName: github-repo name (e.g. schulzSystemtechnik/repo1)
            // registryUrl: https://github.com
            //
            // this manager will replace the version number in the answers file;
            // (the post-tasks will only run when there is a file change)
        },
    ],    
    
    allowPostUpgradeCommandTemplating: true,
    allowedPostUpgradeCommands: [
        '^docker',
    ],
    packageRules: [
        {
            matchManagers: ['regex'],
            postUpgradeTasks: {
                commands: [
                    // pwd: /tmp/renovate/repos/github/REPO_NAME
                    [
                        'docker run --rm -u 1000 -v $(pwd):/repo -w /repo -e GIT_USER=pQraus -e GIT_PW=', 
                        process.env.RENOVATE_TOKEN, 
                        ' -e NEW_VERSION={{{ newValue }}} -e ANSWERS_FILE={{{ packageFile }}} ',
                        'schulzsystemtechnik/pqraus-sandkasten:copier'
                        // TODO change image name
                    ].join('')
                ],
                executionMode: 'branch',
                fileFilters: [
                    '**/.*',
                    '**/**',
                    '.**/**',
                    '.**/.**',
                    '.**/.*'
                ]
            }
        }
    ]
};
