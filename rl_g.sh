cd getMarket
ps u -e | grep uvicorn | grep main | awk '{print $2}' | xargs kill -15
while :
do
    IS_SERVER_LIVE=$(command ps u -e | grep uvicorn | grep main | wc -l)
    if [ ${IS_SERVER_LIVE} -eq 0 ]
    then
        break
    fi
    sleep 0.5
done
nohup uvicorn main:app --workers 3 &
tail -f -n 50 nohup.out
