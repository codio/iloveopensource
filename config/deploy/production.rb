server 'iloveopensource.io', :app, :web, :db, :primary => true
set :applicationdir, "/var/www/#{application}"
set :deploy_to, applicationdir
