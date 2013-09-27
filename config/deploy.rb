set :application, "iloveopensource"
set :repository,  "https://github.com/codio/iloveopensource.git"
set :scm, :git
set :main_js, "app.js"
set :keep_releases, 3
set :use_sudo, false

desc "Setup the Production Env"
 task :production do
   set :branch, 'master'
   set :envStr, 'NODE_ENV=production'
   set :domain, 'iloveopensource.io'
   set :user, 'deployer'
   set :applicationdir, "/var/www/#{application}"
   set :deploy_to, applicationdir
 
   server "#{domain}", :app, :web, :db, :primary => true

    task :tail do
      resp = capture "forever logs | grep #{applicationdir}/current/#{main_js}"
      log = resp.split(" ").last
      log.gsub!("\e[35m", "")
      log.gsub!("\e[39m", "")
      run "tail -f #{log}"
    end
 end
 
 namespace :deploy do
 
   before 'deploy:start', 'deploy:npm_install'
   before 'deploy:restart', 'deploy:npm_install'
   after 'deploy:npm_install', 'deploy:grunt'
   after 'deploy:create_symlink', 'deploy:symlink_config'

 
   desc "START the servers"
     task :start, :roles => :app, :except => { :no_release => true } do
     run "#{envStr} forever start #{current_path}/#{main_js}"
   end
 
   desc "STOP the servers"
     task :stop, :roles => :app, :except => { :no_release => true } do
     run "forever stop #{current_path}/#{main_js}"
   end
 
   desc "RESTART the servers"
     task :restart, :roles => :app, :except => { :no_release => true } do
     run "#{envStr} forever restart #{current_path}/#{main_js}"
   end

   task :npm_install, :roles => :app, :except => { :no_release => true } do
     run "cd #{current_path} && npm install"
   end

   task :grunt, :roles => :app, :except => { :no_release => true } do
     run "cd #{current_path} && grunt update"
   end

   task :symlink_config, :roles => :app, :except => { :no_release => true } do
     run "ln -s #{applicationdir}/shared/config.production.js #{current_path}/config/config.production.js"
   end
 
 end