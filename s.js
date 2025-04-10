document.addEventListener("DOMContentLoaded", function() {
    
    const ordersUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSix_NWw-t69LaLJ2EENmrQmmKsEzIaijoPB_ThqUpgEWMsJyvfZL5691oPBaWvCLiegI0OUKD2ha4W/pub?gid=2142342141&single=true&output=csv";
    const dispatchUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5ZO4mvjCEAbv4l3-bZUOwBvLl_d6aHPtvYinZPxZ1NpCq4nyjVFrFV_nDXIRpga-htqmsCQm04e3b/pub?gid=0&single=true&output=csv";
    const press1Url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQWyG_VzKb6w8HAYffBwRi6I8qCVwd7DuGwBOusR97QigRl4KvPqI8JGi6SnUWWrPnyngP6n47oRIss/pub?gid=0&single=true&output=csv";
    const press2Url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQWyG_VzKb6w8HAYffBwRi6I8qCVwd7DuGwBOusR97QigRl4KvPqI8JGi6SnUWWrPnyngP6n47oRIss/pub?gid=0&single=true&output=csv";

    let ordersRows, dispatchRows, press1Rows, press2Rows;

    
    Promise.all([
        fetch(ordersUrl).then(res => res.text()),
        fetch(dispatchUrl).then(res => res.text()),
        fetch(press1Url).then(res => res.text()),
        fetch(press2Url).then(res => res.text())
    ])
    .then(([ordersData, dispatchData, press1Data, press2Data]) => {
       
        ordersRows = parseCSV(ordersData);
        dispatchRows = parseCSV(dispatchData);
        press1Rows = parseCSV(press1Data);
        press2Rows = parseCSV(press2Data);

        updateDashboard();  
    })
    .catch(error => {
        console.error("Error fetching data: ", error);
    });

   
    function parseCSV(csvData) {
        return csvData.split('\n').map(row => row.split(','));
    }

    
    function filterDataByDate() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (!startDate && !endDate) {
            return { orders: [], dispatch: [], press1: [], press2: [] }; 
        }

        const filteredOrders = filterOrdersByDate(ordersRows, startDate, endDate);
        const filteredDispatch = filterDispatchByDate(dispatchRows, startDate, endDate);
        const filteredPress1 = filterPressDataByDate(press1Rows, startDate, endDate, 'HP01');
        const filteredPress2 = filterPressDataByDate(press2Rows, startDate, endDate, 'HP02');

        return {
            orders: filteredOrders,
            dispatch: filteredDispatch,
            press1: filteredPress1,
            press2: filteredPress2
        };
    }

   
    function filterOrdersByDate(data, startDate, endDate) {
        const dateColumnIndex = 0;  
        return data.filter((row, index) => {
            if (index === 0) return true;  
            const orderDateStr = row[dateColumnIndex];
            const orderDate = parseDate(orderDateStr);
            return isWithinDateRange(orderDate, startDate, endDate);
        });
    }

   
    function filterDispatchByDate(data, startDate, endDate) {
        const dateColumnIndex = 0;  
        return data.filter((row, index) => {
            if (index === 0) return true;  

            const dispatchDateStr = row[dateColumnIndex];
            const dispatchDate = parseDate(dispatchDateStr);
            return isWithinDateRange(dispatchDate, startDate, endDate);
        });
    }

    // Filter press data by date and press type
    function filterPressDataByDate(data, startDate, endDate, pressType) {
        const dateColumnIndex = 0; 
        return data.filter((row, index) => {
            if (index === 0) return true;  

            const productionDateStr = row[dateColumnIndex];
            const productionDate = parseDate(productionDateStr);
            const isInDateRange = isWithinDateRange(productionDate, startDate, endDate);
            const isCorrectPressType = row[7]?.trim() === pressType;

            return isInDateRange && isCorrectPressType;
        });
    }

    // Convert date string to Date object
    function parseDate(dateStr) {
        const [day, month, year] = dateStr.split('/');
        return new Date(`${year}-${month}-${day}`);
    }

    
    function isWithinDateRange(date, startDate, endDate) {
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        return (!start || date >= start) && (!end || date <= end);
    }

   
    function calculateTotalParty(data) {
        const partyNameColumnIndex = 2;  
        const addressColumnIndex = 4;    
        const uniqueParties = new Set();

        
        data.slice(1).forEach(row => {  
            const partyName = row[partyNameColumnIndex]?.trim();  
            const address = row[addressColumnIndex]?.trim();     

            
            if (partyName && address) {
               
                const partyAddressCombination = `${partyName}-${address}`;
                uniqueParties.add(partyAddressCombination);  // Add the combination to the Set
            }
        });

       
        return uniqueParties.size;
    }

    
    function calculateTotalOrders(data) {
        return data.length - 1;  
    }

    
    function calculateTotalQtyOrdered(data) {
        return data.slice(1).reduce((sum, row) => sum + (parseInt(row[5]) || 0), 0);
    }

    
    function calculateTotalDispatch(data) {
        return data.slice(1).reduce((sum, row) => {
            const dispatchQuantity = parseInt(row[2]) || 0; 
            return sum + dispatchQuantity;
        }, 0);
    }

   
    function calculateTotalProduction(data) {
        return data.slice(1).reduce((sum, row) => sum + (parseInt(row[5]) || 0), 0);
    }

    
    function updateDashboard() {
        const { orders, dispatch, press1, press2 } = filterDataByDate();

        const totals = orders.length > 1 || dispatch.length > 1 || press1.length > 1 || press2.length > 1
            ? {
                totalOrders: calculateTotalOrders(orders),
                totalQtyOrdered: calculateTotalQtyOrdered(orders),
                totalDispatch: calculateTotalDispatch(dispatch),
                totalProductionPress1: calculateTotalProduction(press1),
                totalProductionPress2: calculateTotalProduction(press2),
                totalParty: calculateTotalParty(orders)  // Calculate the unique parties here
            }
            : {
                totalOrders: 0,
                totalQtyOrdered: 0,
                totalDispatch: 0,
                totalProductionPress1: 0,
                totalProductionPress2: 0,
                totalParty: 0  // Default to 0 if no data
            };

      
        document.getElementById('total-orders').textContent = totals.totalOrders;
        document.getElementById('total-qty-ordered').textContent = totals.totalQtyOrdered;
        document.getElementById('total-dispatch').textContent = totals.totalDispatch;
        document.getElementById('total-production-press1').textContent = totals.totalProductionPress1;
        document.getElementById('total-production-press2').textContent = totals.totalProductionPress2;
        document.getElementById('total-party').textContent = totals.totalParty;  // Update the Total Party count
    }

    
    window.applyDateFilter = function() {
        updateDashboard();  // Update dashboard after applying filter
    };
});
