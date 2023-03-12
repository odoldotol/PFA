cd getMarket
ps u -e | grep uvicorn | grep main | awk '{print $2}' | xargs kill -15
wait
nohup uvicorn main:app --workers 3 &
tail -f -n 100 nohup.out
