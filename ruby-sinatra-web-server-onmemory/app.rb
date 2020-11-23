require 'sinatra'

set :port, 8000
set :environment, :producntion

app_root = File.dirname(__FILE__)
set :public_folder, app_root + '/public'
set :views, app_root + '/views'

get '/' do
  'うんこ'
end

get '/main_erb' do
  erb :main_erb
end

get '/main_md' do
  markdown :main_md
end
