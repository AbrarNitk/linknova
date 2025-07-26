export PROFILE_NAME=dev
export PORT=8000
export DATABASE_URL=postgres://root:root@127.0.0.1:5432/linknova
export RUST_LOG=debug
export PROJDIR=`pwd`

source etc/zsh/auto.sh

function run() {
    cargo run -p service
}