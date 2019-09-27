# Release procedure

A release usually takes place every two weeks. The release process starts the morning before the sprint ends (ie. if the sprint ends on a Wednesday, the process starts on the Tuesday) when the code is pushed to `qa` branch. After successful review, it is pushed to `preprod`. When ready, the code is pushed to `master` by close of play on the first Friday of the sprint. DevOps will deploy the code to live on the following Monday.

# Version numbering

Most releases will be a minor update (ie. 1.20.0 to 1.21.0). If a change is made to the `dev` branch after the minor update, but before the code is deployed to live, then this will be a patch update (ie. 1.20.0 to 1.20.1) and the procedure will start again with the new version being pushed to `qa`, then to `preprod`, and eventually to `master`.

# Version update directions

First ensure you are on the latest version of `dev`:



```bash
git checkout dev
git pull

# update the version number in package.json

# ensure shrinkwrap it upto date
rm -fr node_modules
npm i
```

Bump the version number. For a minor version:
```bash
npm version minor
```
Or for a patch version:
```bash
npm version patch
```

This creates a new version branch (eg. `update-to-v1.21.0`), bumps the version number in `package.json`, stages and commits the changes, and pushes up the version branch.

Open GitHub and raise a pull request for this branch. When it's ready to merge, squash and merge changes to `dev`.

Check out the `dev` branch and pull it down again:

```bash
git checkout dev
git pull
```

The following script will tag it with the new version number and push the tag up:

```bash
npm run version-tag
```

At this point, `dev` branch will be the release. Move the code to `qa` branch:

```bash
git checkout qa
git rebase dev
git push
```

Once QA has been passed, move the code to `preprod` branch:

```bash
git checkout preprod
git rebase qa
git push
```

Finally, move the code to `master` branch when ready:

```bash
git checkout master
git rebase preprod
git push
```
