let selectedPlayer = null

let csvRows = []

// Load saved data when the app starts
function loadData() {

    let saved = localStorage.getItem("playerFeedbackData")

    if (saved) {
        csvRows = JSON.parse(saved)
        console.log("Loaded", csvRows.length, "rows from storage")
    }
}

// Save data persistently
function saveData() {

    localStorage.setItem(
        "playerFeedbackData",
        JSON.stringify(csvRows)
    )
}


const metrics = [
        "Energy",
        "Intensity",
        "Technical",
        "Tactical",
        "Understanding",
        "Fun",
        "PlayerPerformance"
]

const metricLabels = {

    Energy: {
        left: "Exhausted",
        right: "Full Energy"
    },

    Intensity: {
        left: "Very Low",
        right: "Very High"
    },

    Technical: {
        left: "Very Easy",
        right: "Very Hard"
    },

    Tactical: {
        left: "Very Easy",
        right: "Very Hard"
    },

    Understanding: {
        left: "Confused",
        right: "Very Clear"
    },

    Fun: {
        left: "Not Fun",
        right: "Very Fun"
    },

    PlayerPerformance: {
        left: "Poor Performance",
        right: "Best Performance"
    }
}

const players_numbers = [
1,2,4,5,6,7,8,9,10,11,12,13,14,16,17,18,19,78]

function createPlayers() {

    let container = document.getElementById("players")

    for (let i = 0; i < players_numbers.length; i++) {

        let btn = document.createElement("button")

        btn.innerText = players_numbers[i]

        btn.onclick = () => {

            selectedPlayer = players_numbers[i]

            document.querySelectorAll("#players button").forEach(b =>
                b.classList.remove("selected")
            )
            document.getElementById("current-player").innerText =
               "Selected Player: " + players_numbers[i];
            btn.classList.add("selected")
        }

        container.appendChild(btn)
    }
}

function createSliders() {

    let container = document.getElementById("sliders")

    metrics.forEach(metric => {

        let div = document.createElement("div")

        div.className = "slider-container"

        div.innerHTML = `

            <label>
                ${metric}:
                <span id="${metric}-value">5</span>
            </label>

            <input
                type="range"
                min="1"
                max="10"
                value="5"
                id="${metric}"
                oninput="updateValue('${metric}')"
            >

            <div class="slider-scale">

                <span>
                    ${metricLabels[metric].left}
                </span>

                <span>
                    ${metricLabels[metric].right}
                </span>

            </div>
        `

        container.appendChild(div)

    })
}

function updateValue(metric) {

    let value = document.getElementById(metric).value

    document.getElementById(metric + "-value").innerText = value
}

function getCurrentDate() {

    let now = new Date()

    return now.toLocaleDateString(
        "en-CA",
        {
            timeZone: Intl.DateTimeFormat()
                .resolvedOptions()
                .timeZone
        }
    )
}

function submitData() {

    if (!selectedPlayer) {

        alert("Select player")

        return
    }

    let row = {

        date: getCurrentDate(),

        player: selectedPlayer,

        energy: document.getElementById("Energy").value,
        intensity: document.getElementById("Intensity").value,
        technical: document.getElementById("Technical").value,
        tactical: document.getElementById("Tactical").value,
        understanding: document.getElementById("Understanding").value,
        fun: document.getElementById("Fun").value,

        // New fields
        playerPerception: document.getElementById("PlayerPerformance").value,
        coachRating: 5
    }

    csvRows.push(row)

    saveData()

    alert("Saved")

    resetSliders()
}

function resetSliders() {

    metrics.forEach(metric => {

        document.getElementById(metric).value = 5

        document.getElementById(metric + "-value").innerText = 5
    })
}

async function downloadCSV() {

    if (csvRows.length === 0) {

        alert("No data yet")

        return
    }

    let header = [

        "date",
        "player",
        "energy",
        "intensity",
        "technical",
        "tactical",
        "understanding",
        "fun",
        "performance",
        "coachRating"
    ]

    let csvContent = header.join(",") + "\n"

    csvRows.forEach(row => {

        csvContent += [

            row.date,
            row.player,
            row.energy,
            row.intensity,
            row.technical,
            row.tactical,
            row.understanding,
            row.fun,
            row.performance,
            row.coachRating

        ].join(",") + "\n"
    })

    let file = new File(

        [csvContent],

        "player_feedback.csv",

        {
            type: "text/csv"
        }
    )

    // iPhone/iPad native sharing
    if (navigator.share) {

        try {

            await navigator.share({

                files: [file],

                title: "Player Feedback CSV"

            })

        } catch (err) {

            console.log("Share cancelled")
        }

    } else {

        // fallback desktop download

        let url =
            URL.createObjectURL(file)

        let a =
            document.createElement("a")

        a.href = url

        a.download =
            "player_feedback.csv"

        a.click()
    }
}

function clearData() {

    if (csvRows.length === 0) {

        alert("No data to clear")

        return
    }

    let confirmClear = confirm(
        "Are you sure you want to delete all data?"
    )

    if (confirmClear) {

        csvRows = []
        localStorage.removeItem("playerFeedbackData")
        alert("All data cleared")

    }
}

function copyCSV() {

    if (csvRows.length === 0) {

        alert("No data yet")

        return
    }

    let header = [

        "date",
        "player",
        "energy",
        "intensity",
        "technical",
        "tactical",
        "understanding",
        "fun",
        "performance",
        "coachRating"
    ]

    let csvContent = header.join(",") + "\n"

    csvRows.forEach(row => {

        csvContent += [

            row.date,
            row.player,
            row.energy,
            row.intensity,
            row.technical,
            row.tactical,
            row.understanding,
            row.fun,
            row.performance,
            row.coachRating

        ].join(",") + "\n"
    })

    // Create hidden textarea
    let textarea =
        document.createElement("textarea")

    textarea.value = csvContent

    document.body.appendChild(textarea)

    textarea.select()

    textarea.setSelectionRange(
        0,
        999999
    )

    try {

        document.execCommand("copy")

        alert("CSV copied to clipboard")

    } catch (err) {

        alert("Copy failed")
    }

    document.body.removeChild(textarea)
}

function openCoachRatingPopup() {

    // Remove existing popup if already open
    let existing = document.getElementById("coach-popup")

    if (existing) {
        existing.remove()
    }

    // Background overlay
    let popup = document.createElement("div")

    popup.id = "coach-popup"

    popup.style.position = "fixed"
    popup.style.top = "0"
    popup.style.left = "0"
    popup.style.width = "100%"
    popup.style.height = "100%"
    popup.style.backgroundColor = "rgba(0,0,0,0.7)"
    popup.style.zIndex = "9999"
    popup.style.overflow = "auto"
    popup.style.padding = "20px"

    // White content box
    let content = document.createElement("div")

    content.style.background = "white"
    content.style.padding = "20px"
    content.style.borderRadius = "10px"
    content.style.maxWidth = "600px"
    content.style.margin = "auto"

    // Title
    let title = document.createElement("h2")

    title.innerText = "Coach Ratings"

    content.appendChild(title)

    // Unique players who submitted data
    let players = [...new Set(csvRows.map(r => r.player))]

    players.forEach(player => {

        let container = document.createElement("div")

        container.style.marginBottom = "20px"

        // Label
        let label = document.createElement("label")

        label.innerText = "Player " + player + ": "

        // Value display
        let valueSpan = document.createElement("span")

        valueSpan.id = "coach-value-" + player

        valueSpan.innerText = "5"

        // Slider
        let slider = document.createElement("input")

        slider.type = "range"
        slider.min = "1"
        slider.max = "10"
        slider.value = "5"

        slider.style.width = "100%"

        slider.oninput = () => {

        valueSpan.innerText = slider.value

        // Update all entries for that player
        csvRows.forEach(row => {

            if (row.player == player) {

                        row.coachRating = slider.value
                    }
                })

            saveData()
        }

        container.appendChild(label)
        container.appendChild(valueSpan)
        container.appendChild(document.createElement("br"))
        container.appendChild(slider)

        content.appendChild(container)
    })

    // Close button
    let closeBtn = document.createElement("button")

    closeBtn.innerText = "Close"

    closeBtn.className = "download-btn"

    closeBtn.onclick = () => {

        popup.remove()
    }

    content.appendChild(closeBtn)

    popup.appendChild(content)

    document.body.appendChild(popup)
}

loadData()
createPlayers()
createSliders()
if ("serviceWorker" in navigator) {

    navigator.serviceWorker
        .register("./service-worker.js")
        .then(() => console.log("Service Worker Registered"))
}