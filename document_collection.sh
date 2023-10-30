cd ~/Documents/research-notes/
git add .
git commit -am "update notes"
git pull
source .rag/bin/activate
cd rag
docker compose up -d
make refresh
deactivate
