let InsertTable = async () => {
    const result = await fetch('/users/show', {
        method:'GET'
    }).then((res) => {return res.json();});
    //console.log('result', result);
    if (result.status === 'ok') {
        const numOfHw = Object.keys((result.userData)[0]).length - 3;
        let BulidTableHead = async () => {
            let userHead = document.getElementById('userhead');
            let shadowHead = document.getElementById('shadowhead');
            let usertr = userHead.getElementsByTagName('tr');
            let shadowtr = shadowHead.getElementsByTagName('tr');
            for (let i = 1; i <= numOfHw + 1; ++i) {
                let userChild = document.createElement('th');
                let shadowChild = document.createElement('th');
                userChild.innerHTML = (i < numOfHw+1)? 'hw'+i.toString() : 'realhashpw';
                shadowChild.innerHTML = 'hashpw' + i.toString();
                usertr[0].appendChild(userChild);
                shadowtr[0].appendChild(shadowChild);
            }
        }
        
        let userBody = document.getElementById('userbody');
        let shadowBody = document.getElementById('shadowbody');
        let honeycheckerBody = document.getElementById('honeycheckerbody');
        BulidTableHead();
        const dataLength = result.userData.length;
        for (let i = 0; i < dataLength; ++i) {
            //show user
            let rowChild = document.createElement('tr');
            for (const [key, value] of Object.entries(result.userData[i])) {
                let tdChild = document.createElement('td');
                tdChild.innerHTML = value;
                rowChild.appendChild(tdChild);
            }
            userBody.appendChild(rowChild);
            //show shadow
            rowChild = document.createElement('tr');
            for (const [key, value] of Object.entries(result.shadowData[i])) {
                let tdChild = document.createElement('td');
                tdChild.innerHTML = value;
                rowChild.appendChild(tdChild);
            }
            shadowBody.appendChild(rowChild);
            //show honeychecker
            rowChild = document.createElement('tr');
            for (const [key, value] of Object.entries(result.honeycheckerData[i])) {
                let tdChild = document.createElement('td');
                tdChild.innerHTML = value;
                rowChild.appendChild(tdChild);
            }
            honeycheckerBody.appendChild(rowChild);
        }
    }
}
InsertTable();