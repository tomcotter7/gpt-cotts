fastapi:
	cd gpt-cotts-fastapi && uvicorn main:app --reload

web:
	cd gpt-cotts-frontend && npm run build && npm run start
