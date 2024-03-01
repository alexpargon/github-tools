# for those using GitHub CLI
# there is an easy way to obtain a token from command line
# post initial authenticating  
# if I'm not wrong github access token prefix could differ
# -> classic token vs fine grained token 
#
# below produced with
# gh version 2.4.0+dfsg1 (2022-03-23 Ubuntu 2.4.0+dfsg1-2)
# https://github.com/cli/cli/releases/latest
token_prefix="gho." 
token=$(gh auth status --show-token 2>&1) 
GITHUB_ACCESS_TOKEN=$(echo $token | grep -o -P "$token_prefix{37}") 
# confirm token value is correct - before adding to scripts
echo $GITHUB_ACCESS_TOKEN

# with a token which relevant access to GitHub org
# curl
curl -H "Authorization: token ${GITHUB_ACCESS_TOKEN}" https://api.github.com/orgs/dygmalab/teams
# curl + jq
curl -s -H "Authorization: token ${GITHUB_ACCESS_TOKEN}" https://api.github.com/orgs/dygmalab/teams | jq -r '.[]'
# curl + jq - show id and name
curl -s -H "Authorization: token ${GITHUB_ACCESS_TOKEN}" https://api.github.com/orgs/dygmalab/teams | jq -r '.[] | "\(.id) \t \(.name)"'
# curl + jq + team name grep
curl -s -H "Authorization: token $GITHUB_ACCESS_TOKEN" https://api.github.com/orgs/dygmalab/teams | jq -r '.[] | "\(.id) \t \(.name)"' | grep -i foo