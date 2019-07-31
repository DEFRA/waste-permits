# Release procedure

In general, a release takes place every two weeks. The release process starts the day before the sprint ends (ie. our sprint ends on Wednesday so the process starts on the Tuesday) when the code is pushed to `qa` branch. After successful review, it is pushed to `preprod`. When ready, the code is pushed to `master` by close of play on the first Friday of the sprint. DevOps will deploy the code to live on the following Monday.

# Version numbering

Most releases will be a minor update (ie. 1.20.0 to 1.21.0). If a change is made to the dev branch after the minor update, but before the code is deployed to live, then this will be a patch update (ie. 1.20.0 to 1.20.1) and the procedure will start again with the new version being pushed to `qa`, then to `preprod`, and eventually to `master`.

# Version update directions

Create a new branch for the version update:

```
git checkout -b update-to-v1.21.0
```

Edit the version string in `package.json`.

Update `npm-shrinkwrap.json`:

```
npm install
```

Add and commit changes, then push to `origin`:

```
git add --all
git commit --message="Update version to v1.21.0"
git push --set-upstream origin update-to-v1.21.0
```

Open GitHub, open a pull request for this branch, then squash and merge changes to `dev`.

Check out the `dev` branch and pull it down:

```
git checkout dev
git pull
```

Tag it with the version number and push the tag up:

```
git tag --annotate --message="Update version to v1.21.0" v1.21.0
git push origin v1.21.0
```

At this point, `dev` branch will be the release. Move the code to `qa` branch:

```
git checkout qa
git rebase dev
git push
```

Once QA has been passed, move the code to `preprod` branch:

```
git checkout preprod
git rebase qa
git push
```

Finally, move the code to `master` branch when ready:

```
git checkout master
git rebase preprod
git push
```
