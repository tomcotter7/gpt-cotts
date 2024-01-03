cd ~/Documents/projects/gpt-cotts/
git add .
git commit -am "update notes"
git pull
source venv/bin/activate
make refresh
deactivate
