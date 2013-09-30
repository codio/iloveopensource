server 'iloveopensource.io', :app, :web, :db, :primary => true
set :applicationdir, "/var/www/staging.#{application}"
set :deploy_to, applicationdir
