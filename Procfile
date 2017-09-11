# As per heroku best practices https://devcenter.heroku.com/articles/node-best-practices
# we optimize to avoid garbage. Node (V8) uses a lazy and greedy garbage
# collector and has default limit of about 1.5 GB. We can control the garbage
# collector using flags.
# On the Heroku free tier we are limted to only 512mb per dyno, so the
# following tailors node to run in a container of this size.
web: node --optimize_for_size --max_old_space_size=460 --gc_interval=100 server.js
