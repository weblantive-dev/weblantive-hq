export const JOKES = [
  "Why did the entrepreneur bring a ladder to the pitch meeting? Because they heard the stakes were high.",
  "I told my accountant I wanted to make millions while sleeping. He said 'That's called passive income.' I said 'I call it Tuesday.'",
  "Why do entrepreneurs never look out the window in the morning? Because then they'd have nothing to do in the afternoon.",
  "A startup founder walks into a bar. The bar has no chairs yet — it's an MVP.",
  "Why did the entrepreneur fail at farming? Too many pivot strategies, not enough actual crops.",
  "My business plan has three stages: 1. Start. 2. ??? 3. Profit. Still working on stage 2.",
  "I asked my mentor how long it takes to be successful. He said '10 years.' I said I didn't have that long. He said 'Then 20.'",
  "Why did the web designer go broke? Because he kept losing his cookies.",
  "I told my client their website would change their life. I didn't say whose.",
  "Why do entrepreneurs hate elevators? They prefer pitching on the way up.",
  "My business is doing really well. By 'doing well' I mean it's still alive. That counts.",
  "Why did the entrepreneur sleep on the office floor? Because he was trying to get closer to his goals.",
  "I'm not saying I work hard, but my coffee machine has separation anxiety.",
  "The first rule of owning a business: never tell anyone how much sleep you're not getting.",
  "Why do entrepreneurs always carry a pen? Because opportunities don't come with a pencil.",
  "I asked a successful entrepreneur what his secret was. He said 'I woke up at 5am.' I said 'Then what?' He said 'Regretted it immediately but stayed up anyway.'",
  "My business model is simple: step 1, make it. Step 2, sell it. Step 3, Google 'how to make it' and 'how to sell it.'",
  "Why don't entrepreneurs play hide and seek? Because good luck hiding when you're always networking.",
  "I love being my own boss. Yesterday I gave myself the day off. Then I fired myself for slacking.",
  "Why did the web designer go to therapy? Too many unresolved issues.",
  "Running a business is like riding a bicycle. Except the bicycle is on fire. And the road is on fire. Everything is fine.",
  "My LinkedIn says 'self-motivated entrepreneur.' My bank account says 'please find other motivation.'",
  "Why do entrepreneurs never finish a cup of coffee? Because they keep pivoting before it's done.",
  "I built a website in a day. My client said it looked rushed. I said 'That's the premium package.'",
  "The best thing about being your own boss is flexible hours. The worst thing is you're always working them.",
  "Why did the entrepreneur bring a mirror to his meeting? To reflect on his strategy.",
  "I asked my client what budget they had. They said 'flexible.' That means zero.",
  "Why do entrepreneurs love broken clocks? Because even they're right twice a day.",
  "My morning routine: wake up, check emails, panic, make coffee, panic slightly less, conquer the world.",
  "Why did the entrepreneur plant seeds in his office? He wanted to grow his business organically.",
  "Entrepreneurship is just adult problem-solving with no manual and no safety net. Basically skydiving but for money.",
  "I told myself I'd sleep when I'm rich. Turns out I've been very consistent on that promise — still waiting on both."
]

export const QUOTES = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "Your most unhappy customers are your greatest source of learning. — Bill Gates",
  "It does not matter how slowly you go as long as you do not stop. — Confucius",
  "Success is not final, failure is not fatal: It is the courage to continue that counts. — Winston Churchill",
  "The way to get started is to quit talking and begin doing. — Walt Disney",
  "Don't watch the clock; do what it does. Keep going. — Sam Levenson",
  "Opportunities don't happen. You create them. — Chris Grosser",
  "Success usually comes to those who are too busy to be looking for it. — Henry David Thoreau",
  "I find that the harder I work, the more luck I seem to have. — Thomas Jefferson",
  "The only place where success comes before work is in the dictionary. — Vidal Sassoon",
  "Don't be afraid to give up the good to go for the great. — John D. Rockefeller",
  "I never dreamed about success. I worked for it. — Estée Lauder",
  "You miss 100% of the shots you don't take. — Wayne Gretzky",
  "Whether you think you can or you think you can't, you're right. — Henry Ford",
  "The fastest way to change yourself is to hang out with people who are already the way you want to be. — Reid Hoffman",
  "If you are not willing to risk the usual, you will have to settle for the ordinary. — Jim Rohn",
  "In the middle of every difficulty lies opportunity. — Albert Einstein",
  "Do what you can, with what you have, where you are. — Theodore Roosevelt",
  "It's not about ideas. It's about making ideas happen. — Scott Belsky",
  "Build something 100 people love, not something 1 million people kind of like. — Brian Chesky",
  "Chase the vision, not the money; the money will end up following you. — Tony Hsieh",
  "The richest people in the world look for and build networks, everyone else looks for work. — Robert Kiyosaki",
  "An entrepreneur is someone who jumps off a cliff and builds a plane on the way down. — Reid Hoffman",
  "Entrepreneurship is living a few years of your life like most people won't, so that you can spend the rest of your life like most people can't.",
  "Work like there is someone working 24 hours a day to take it all away from you. — Mark Cuban",
  "You don't have to be great to start, but you have to start to be great. — Zig Ziglar",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Dream it. Wish it. Do it.",
  "Success is walking from failure to failure with no loss of enthusiasm. — Winston Churchill",
  "If you want something you've never had, you must be willing to do something you've never done.",
  "Stop doubting yourself, work hard, and make it happen.",
  "Great things never come from comfort zones.",
  "Push yourself, because no one else is going to do it for you."
]

export const GREETINGS = [
  "Good morning, CEO Mulanda 👑",
  "Rise and grind, Boss Mulanda 🔥",
  "Let's get it, Chief Mulanda 💼",
  "Welcome back, Founder Mulanda 🚀",
  "Ready to close deals, Boss? 💰",
  "The empire doesn't build itself, CEO 👑",
  "Another day, another victory, Mulanda 🏆",
  "The world is yours today, Boss 🌍",
  "Clock in, CEO Mulanda — let's build 🔨",
  "Big moves only today, Mulanda 💎"
]

export const getDailyContent = () => {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  return {
    joke: JOKES[dayOfYear % JOKES.length],
    quote: QUOTES[dayOfYear % QUOTES.length],
    greeting: GREETINGS[dayOfYear % GREETINGS.length]
  }
}
