
const live = document.getElementById('live');
const matchesContainer = document.getElementById('matches-container');
const match = document.querySelector('.match');
const livematch = document.querySelector('livematch');


/*
document.addEventListener('DOMContentLoaded', async () => {
  matchesContainer.addEventListener('click', async (event) => {
    const liveLink = event.target.closest('.match a#live');
    
    if (liveLink) {
      event.preventDefault();
      
      const liveSrc = liveLink.getAttribute('href');
      console.log('Clicked link src:', liveSrc);
      
      const response = await fetch('/live', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ liveSrc }),
      });
      
      if (response.ok) {
        const liveStream = await response.json();
        
        console.log('Live stream:',liveStream);
        
        const livematchElement = document.querySelector('.livematch');
        if (livematchElement) {
          const iframe = document.createElement('iframe');
          iframe.src = livematchSrc;
          iframe.width = '100%';
          iframe.height = '500px';
          livematchElement.innerHTML = ''; // Clear previous content
          livematchElement.appendChild(iframe);
        } else {
          console.error('.livematch element not found.');
        }
      }
    }
  });
});


*/


async function fetchData() {

      loader.style.display = 'block';

    try {
      const response = await fetch('/api/matches');
      const data = await response.json();

      loader.style.display = 'none';

      data.forEach(match => {
        const matchElement = document.createElement('div');
        matchElement.classList.add('match');
        matchElement.innerHTML = `
  
                    <div class="vs">
                            
                            <div class="right_team">

                                    <h1>${match.rightTeamName}</h1>
                                    <img src="${match.rightLogo}" alt="">

                            </div>

                            
                            <div class="match_time">

                                      <h3 class="result">${match.result}</h3>

                                      <h1>${match.matchTime}</h1> 
                                  
                                      <a id="live" href="${match.link}">Watch here</a>

                                  </div>
                            
                            <div class="left_team">

                                    <h1>${match.leftTeamName}</h1>
                                    <img src="${match.leftLogo}" alt="">

                            </div>
                    </div>
                              <div class="match_info">
                              
                                  <p>  ${match.matchInfo} </p>

                              </div>

                                  

        `;
        matchesContainer.appendChild(matchElement);
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  fetchData();




