document.getElementById('videoUrl').addEventListener('input', async () => {
    const videoUrl = document.getElementById('videoUrl').value;
    const output = document.querySelector('.output');
    const resultElement = document.getElementById('result');
    const loading = document.querySelector('.loading');

    // Tampilkan loading indicator
    loading.style.display = "block";
    output.style.display = "grid";

    if (!videoUrl) {
        output.textContent = '';
        loading.style.display = "none";
        return;
    }

    try {
        // Kirim permintaan ke server untuk menyelesaikan URL pendek
        const resolveResponse = await fetch('/resolve-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ videoUrl })
        });

        const resolveData = await resolveResponse.json();

        if (resolveData.fullUrl) {
            // Kirim permintaan ke server untuk mendapatkan data video TikTok
            const videoResponse = await fetch(`/api/tiktok?videoUrl=${encodeURIComponent(resolveData.fullUrl)}`);
            const videoData = await videoResponse.json();

            if (videoData.error) {
                output.textContent = `Error: ${videoData.error}`;
                loading.style.display = "none";
                return;
            }

            // Fungsi untuk memformat angka dengan satuan
            function formatNumberWithUnit(number) {
                if (number >= 1e6) return (number / 1e6).toFixed(1) + 'M';
                if (number >= 1e3) return (number / 1e3).toFixed(1) + 'k';
                return number.toString();
            }

            // Format angka statistik
            const formattedLikes = formatNumberWithUnit(videoData.stats.likes);
            const formattedComments = formatNumberWithUnit(videoData.stats.comments);
            const formattedViews = formatNumberWithUnit(videoData.stats.views);
            output.style.display = "grid"

            // Tampilkan data video di UI
            output.innerHTML = `
                <div class="cover">
                    <img src="${videoData.cover}" alt="">
                </div>
                <ul class="video-information">
                    <img src="${videoData.author.avatar}" class="avatar">
                    <li><i class="ph ph-heart"></i><p>${formattedLikes}</p></li>
                    <li><i class="ph ph-chat-circle-dots"></i><p>${formattedComments}</p></li>
                    <li><i class="ph-fill ph-play"></i><p>${formattedViews}</p></li>
                </ul>
                <p class="nickname">@${videoData.author.nickname}</p>
                <p class="caption">${videoData.description}</p>
                <a href="${videoData.downloadUrl}" target="_blank" class="download-btn">DOWNLOAD VIDEO</a>
            `;
        } else {
            resultElement.textContent = 'Error: ' + (resolveData.error || 'Unknown error');
        }
    } catch (error) {
        console.error('Error:', error);
        resultElement.textContent = 'Error processing your request.';
    } finally {
        // Sembunyikan loading indicator
        loading.style.display = "none";
    }
});
