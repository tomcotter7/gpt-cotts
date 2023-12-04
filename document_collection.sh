cd ~/Documents/projects/gpt-cotts/
git add .
git commit -am "update notes"
git pull
source .rag/bin/activate
cd rag
docker compose up -d
make refresh
deactivate
