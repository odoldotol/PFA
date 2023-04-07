cd getMarket
ps u -e | grep uvicorn | grep main | awk '{print $2}' | xargs kill -15
while :
do
    if [ $(command ps u -e | grep uvicorn | grep main | wc -l) -eq 0 ]
    then
        break
    fi
    sleep 0.5
done
echo "server down"
nohup uvicorn main:app --workers 1 &
while :
do
    if [ $(command tail -n 15 nohup.out | grep "Application startup complete." | wc -l) -eq 1 ]
    then
        break
    fi
    sleep 0.5
done
tail -n 12 nohup.out