@echo off
::Check if the "node_modules" folder is present
if not exist node_modules (
	::Generate the directory via npm
	echo "node_modules" not found. Creating it...
	call npm install
    call npm install typescript -g
)
::Run the TS module
npm run-script run-dev