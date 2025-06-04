document.addEventListener("DOMContentLoaded", function () {

    // ✅ Replace these with your actual 2024 and 2025 Google Sheets URLs
    const orders2025Url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSix_NWw-t69LaLJ2EENmrQmmKsEzIaijoPB_ThqUpgEWMsJyvfZL5691oPBaWvCLiegI0OUKD2ha4W/pub?gid=828550122&single=true&output=csv";
    const orders2024Url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRL7estp0t6qMSITkLQHicmLSijQu74oxhOc3dVtNP9TryGu8VoyKrw3ecaGbwkWUDikrX7Rcz8XW-/pub?gid=2142342141&single=true&output=csv";

    const dispatch2025Url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5ZO4mvjCEAbv4l3-bZUOwBvLl_d6aHPtvYinZPxZ1NpCq4nyjVFrFV_nDXIRpga-htqmsCQm04e3b/pub?gid=0&single=true&output=csv";
    const dispatch2024Url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQHI7lyC_Dt5v8lJYm3UZN4ZsktGq-n9QbCbUWGlxA4qIzGOm1LHSUfFVJz4oVTdnX-CO3rgVn1XSux/pub?gid=0&single=true&output=csv&sheet=DISPATCH";

    const press12025Url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQWyG_VzKb6w8HAYffBwRi6I8qCVwd7DuGwBOusR97QigRl4KvPqI8JGi6SnUWWrPnyngP6n47oRIss/pub?gid=0&single=true&output=csv";
    const press12024Url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRgGViYleh1IOBFTCWpNGHmlr0lh4XK0JUAbaJKLcnmLmx3FdWk10er0e5KT0r78jetl4mNlvkuEAFN/pub?gid=0&single=true&output=csv&sheet=RAW DATA";

    const press22025Url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQWyG_VzKb6w8HAYffBwRi6I8qCVwd7DuGwBOusR97QigRl4KvPqI8JGi6SnUWWrPnyngP6n47oRIss/pub?gid=0&single=true&output=csv";
    const press22024Url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRgGViYleh1IOBFTCWpNGHmlr0lh4XK0JUAbaJKLcnmLmx3FdWk10er0e5KT0r78jetl4mNlvkuEAFN/pub?gid=0&single=true&output=csv&sheet=RAW DATA";

    let ordersRows, dispatchRows, press1Rows, press2Rows;

    Promise.all([
        fetch(orders2025Url).then(res => res.text()),
        fetch(orders2024Url).then(res => res.text()),
        fetch(dispatch2025Url).then(res => res.text()),
        fetch(dispatch2024Url).then(res => res.text()),
        fetch(press12025Url).then(res => res.text()),
        fetch(press12024Url).then(res => res.text()),
        fetch(press22025Url).then(res => res.text()),
        fetch(press22024Url).then(res => res.text())
    ])
        .then(([orders2025, orders2024, dispatch2025, dispatch2024, press12025, press12024, press22025, press22024]) => {
            // Parse and combine all
            const parsedOrders2025 = parseCSV(orders2025);
            const parsedOrders2024 = parseCSV(orders2024);
            const parsedDispatch2025 = parseCSV(dispatch2025);
            const parsedDispatch2024 = parseCSV(dispatch2024);
            const parsedPress12025 = parseCSV(press12025);
            const parsedPress12024 = parseCSV(press12024);
            const parsedPress22025 = parseCSV(press22025);
            const parsedPress22024 = parseCSV(press22024);

            ordersRows = [parsedOrders2025[0], ...parsedOrders2025.slice(1), ...parsedOrders2024.slice(1)];
            dispatchRows = [parsedDispatch2025[0], ...parsedDispatch2025.slice(1), ...parsedDispatch2024.slice(1)];
            press1Rows = [parsedPress12025[0], ...parsedPress12025.slice(1), ...parsedPress12024.slice(1)];
            press2Rows = [parsedPress22025[0], ...parsedPress22025.slice(1), ...parsedPress22024.slice(1)];

            updateDashboard();
        })
        .catch(error => {
            console.error("Error fetching data: ", error);
        });

    function parseCSV(csvData) {
        return csvData.trim().split('\n').map(row => row.split(','));
    }

    function filterDataByDate() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (!startDate && !endDate) {
            return { orders: [], dispatch: [], press1: [], press2: [] };
        }

        return {
            orders: filterOrdersByDate(ordersRows, startDate, endDate),
            dispatch: filterDispatchByDate(dispatchRows, startDate, endDate),
            press1: filterPressDataByDate(press1Rows, startDate, endDate, 'HP01'),
            press2: filterPressDataByDate(press2Rows, startDate, endDate, 'HP02')
        };
    }

    function filterOrdersByDate(data, startDate, endDate) {
        const dateColumnIndex = 0;
        return data.filter((row, index) => {
            if (index === 0) return true;
            const date = parseDate(row[dateColumnIndex]);
            return isWithinDateRange(date, startDate, endDate);
        });
    }

    function filterDispatchByDate(data, startDate, endDate) {
        const dateColumnIndex = 0;
        return data.filter((row, index) => {
            if (index === 0) return true;
            const date = parseDate(row[dateColumnIndex]);
            return isWithinDateRange(date, startDate, endDate);
        });
    }

    function filterPressDataByDate(data, startDate, endDate, pressType) {
        const dateColumnIndex = 0;
        return data.filter((row, index) => {
            if (index === 0) return true;
            const date = parseDate(row[dateColumnIndex]);
            return isWithinDateRange(date, startDate, endDate) && row[7]?.trim() === pressType;
        });
    }

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
        const nameIndex = 2;
        const addressIndex = 4;
        const unique = new Set();
        data.slice(1).forEach(row => {
            const key = `${row[nameIndex]?.trim()}-${row[addressIndex]?.trim()}`;
            if (key !== '-') unique.add(key);
        });
        return unique.size;
    }

    function calculateTotalOrders(data) {
        return data.length - 1;
    }

    function calculateTotalQtyOrdered(data) {
        return data.slice(1).reduce((sum, row) => sum + (parseInt(row[5]) || 0), 0);
    }

    function calculateTotalDispatch(data) {
        return data.slice(1).reduce((sum, row) => sum + (parseInt(row[2]) || 0), 0);
    }

    function calculateTotalProduction(data) {
        return data.slice(1).reduce((sum, row) => sum + (parseInt(row[5]) || 0), 0);
    }

    function updateDashboard() {
        const { orders, dispatch, press1, press2 } = filterDataByDate();

        const totals = (orders.length > 1 || dispatch.length > 1 || press1.length > 1 || press2.length > 1)
            ? {
                totalOrders: calculateTotalOrders(orders),
                totalQtyOrdered: calculateTotalQtyOrdered(orders),
                totalDispatch: calculateTotalDispatch(dispatch),
                totalProductionPress1: calculateTotalProduction(press1),
                totalProductionPress2: calculateTotalProduction(press2),
                totalParty: calculateTotalParty(orders)
            }
            : {
                totalOrders: 0,
                totalQtyOrdered: 0,
                totalDispatch: 0,
                totalProductionPress1: 0,
                totalProductionPress2: 0,
                totalParty: 0
            };

        document.getElementById('total-orders').textContent = totals.totalOrders;
        document.getElementById('total-qty-ordered').textContent = totals.totalQtyOrdered;
        document.getElementById('total-dispatch').textContent = totals.totalDispatch;
        document.getElementById('total-production-press1').textContent = totals.totalProductionPress1;
        document.getElementById('total-production-press2').textContent = totals.totalProductionPress2;
        document.getElementById('total-party').textContent = totals.totalParty;
    }

    window.applyDateFilter = function () {
        updateDashboard();
    };
});
