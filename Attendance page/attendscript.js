document.addEventListener('DOMContentLoaded', function() {
    const lastLectureButton = document.querySelector('.last-lecture');
    const monthButton = document.querySelector('.month');
    const semesterButton = document.querySelector('.semester');
    const downloadButton = document.querySelector('.download');

    let selectedOption = '';
    let autoRefreshInterval = null;

    // Function to get the auth token from cookies
    function getAuthToken() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            let [name, value] = cookie.split('=');
            if (name.trim() === 'authToken') {
                return value;
            }
        }
        return null;
    }

    // Function to fetch attendance data
    function fetchAttendanceData(url, noDataMessage) {
        const authToken = getAuthToken();
        if (!authToken) {
            console.error('No auth token found');
            return;
        }

        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    alert(noDataMessage);
                    throw new Error(noDataMessage);
                } else {
                    throw new Error('Network response was not ok');
                }
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            populateTable(data, noDataMessage);
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }

    // Function to populate the table with data
    function populateTable(data, noDataMessage) {
        const tableBody = document.querySelector('#table-body');
        tableBody.innerHTML = ''; // Clear existing content

        if (data.length === 0) {
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = `<td colspan="3">${noDataMessage}</td>`;
            tableBody.appendChild(noDataRow);
        } else {
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.studentName}</td>
                    <td>${item.attendDate}</td>
                    <td>${item.attendTime}</td>
                `;
                tableBody.appendChild(row);
            });
        }
    }

    // Function to start auto-refresh
    function startAutoRefresh(url, noDataMessage) {
        // Clear any existing interval to avoid multiple intervals running
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            console.log('Cleared existing interval');
        }

        // Set a new interval
        autoRefreshInterval = setInterval(() => {
            console.log('Auto-refreshing data');
            fetchAttendanceData(url, noDataMessage);
        }, 30000); // Refresh every 30 seconds
    }

    // Event listener for the Last Lecture button
    lastLectureButton.addEventListener('click', function() {
        selectedOption = 'lastLecture';
        const url = 'https://localhost:7198/api/H406Attend/TodayAttends';
        const noDataMessage = 'There is no attendance today. Have a nice day!';
        fetchAttendanceData(url, noDataMessage);
        startAutoRefresh(url, noDataMessage);
    });

    // Event listener for the Month button
    monthButton.addEventListener('click', function() {
        selectedOption = 'month';
        const url = 'https://localhost:7198/api/H406Attend/MonthAttends';
        const noDataMessage = 'There is no attendance this month. Have a nice day!';
        fetchAttendanceData(url, noDataMessage);
        startAutoRefresh(url, noDataMessage);
    });

    // Event listener for the Semester button
    semesterButton.addEventListener('click', function() {
        selectedOption = 'semester';
        const url = 'https://localhost:7198/api/H406Attend/SemesterAttends';
        const noDataMessage = 'There is no attendance this semester. Have a nice day!';
        fetchAttendanceData(url, noDataMessage);
        startAutoRefresh(url, noDataMessage);
    });

    // Event listener for the Download button
    downloadButton.addEventListener('click', function() {
        const authToken = getAuthToken();
        if (!authToken) {
            console.error('No auth token found');
            return;
        }

        let downloadUrl = '';
        if (selectedOption === 'lastLecture') {
            downloadUrl = 'https://localhost:7198/api/DownloadAsExcel/TodayAttendExcel';
        } else if (selectedOption === 'month') {
            downloadUrl = 'https://localhost:7198/api/DownloadAsExcel/MonthAttendExcel';
        } else if (selectedOption === 'semester') {
            downloadUrl = 'https://localhost:7198/api/DownloadAsExcel/SemesterAttendExcel';
        } else {
            alert('Please select an option to download.');
            return;
        }

        fetch(downloadUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    alert('There is no available attendance data. Have a nice day!');
                } else {
                    throw new Error('Network response was not ok');
                }
                return;
            }
            return response.blob();
        })
        .then(blob => {
            if (blob) {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Attendance.xlsx';  // Modify filename as per option if needed
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    });
});
