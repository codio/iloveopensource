require 'capistrano/ext/multistage'

set :application, "iloveopensource"
set :repository,  "https://github.com/codio/iloveopensource.git"
set :scm, :git
set :main_js, "app.js"
set :use_sudo, false
set :envStr, 'NODE_ENV=production'
set :user, 'deployer'
set :normalize_asset_timestamps, false

# Setup stages
set :stages, %w(production staging)
set :default_stage, "staging"

set :keep_releases, 3

# Deploys the current branch
set(:current_branch) { `git branch --no-color`.match(/\*\s(.+)\n/)[1] || raise("Couldn't determine current branch") }
set :branch, defer { current_branch } unless exists?(:branch)
 
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

    task :tail do
      resp = capture "forever logs | grep #{applicationdir}/current/#{main_js}"
      log = resp.split(" ").last
      log.gsub!("\e[35m", "")
      log.gsub!("\e[39m", "")
      run "tail -f #{log}"
    end
end