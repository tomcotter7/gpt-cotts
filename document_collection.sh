cd ~/Documents/projects/gpt-cotts/
git add .
git commit -am "update notes"
git pull
source .rag/bin/activate
cd rag
make refresh
deactivate
