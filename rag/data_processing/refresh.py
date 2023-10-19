from database.weaviate import upload_to_weaviate
from preprocessing.markdown import load_and_convert
import argparse

def main(weaviate_ip: str):
    
    upload_to_weaviate(load_and_convert(), weaviate_ip)
    

if __name__ == "__main__":
    argParser = argparse.ArgumentParser()
    argParser.add_argument("--weaviate", help="The address of the Weaviate instance.", required=True, type=str)
    args = argParser.parse_args
    main(args.weaviate)
    