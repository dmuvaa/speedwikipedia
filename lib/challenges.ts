import type { Challenge, Difficulty } from "@/lib/types";
import { DIFFICULTIES } from "@/lib/types";
import { titlesMatch } from "@/lib/titles";

type ChallengeSeed = {
  slug: string;
  start: string;
  target: string;
  difficulty: Difficulty;
  category: string;
  featured?: boolean;
  beginner?: boolean;
};

const SEEDS: ChallengeSeed[] = [
  // —— Easy (nearby / intuitive hops) ——
  {
    slug: "cleopatra-to-hollywood",
    start: "Cleopatra",
    target: "Hollywood, Los Angeles",
    difficulty: "easy",
    category: "History",
    beginner: true,
  },
  { slug: "vikings-to-canada", start: "Vikings", target: "Canada", difficulty: "easy", category: "History" },
  { slug: "silk-road-to-venice", start: "Silk Road", target: "Venice", difficulty: "easy", category: "Geography" },
  { slug: "mona-lisa-to-photography", start: "Mona Lisa", target: "Photography", difficulty: "easy", category: "Art" },
  { slug: "olympics-to-television", start: "Olympic Games", target: "Television", difficulty: "easy", category: "Sports" },
  { slug: "coffee-to-jazz", start: "Coffee", target: "Jazz", difficulty: "easy", category: "Food" },
  { slug: "samurai-to-film", start: "Samurai", target: "Film", difficulty: "easy", category: "History" },
  { slug: "nile-to-cotton", start: "Nile", target: "Cotton", difficulty: "easy", category: "Geography" },
  { slug: "paris-to-eiffel-tower", start: "Paris", target: "Eiffel Tower", difficulty: "easy", category: "Geography" },
  { slug: "london-to-shakespeare", start: "London", target: "William Shakespeare", difficulty: "easy", category: "Literature" },
  { slug: "tokyo-to-sushi", start: "Tokyo", target: "Sushi", difficulty: "easy", category: "Food" },
  { slug: "brazil-to-football", start: "Brazil", target: "Association football", difficulty: "easy", category: "Sports" },
  { slug: "egypt-to-pyramids", start: "Egypt", target: "Egyptian pyramids", difficulty: "easy", category: "History" },
  { slug: "italy-to-pizza", start: "Italy", target: "Pizza", difficulty: "easy", category: "Food" },
  { slug: "beatles-to-liverpool", start: "The Beatles", target: "Liverpool", difficulty: "easy", category: "Music" },
  { slug: "apple-inc-to-iphone", start: "Apple Inc.", target: "iPhone", difficulty: "easy", category: "Technology" },
  { slug: "nasa-to-moon-landing", start: "NASA", target: "Apollo 11", difficulty: "easy", category: "Science" },
  { slug: "dinosaur-to-fossil", start: "Dinosaur", target: "Fossil", difficulty: "easy", category: "Science" },
  { slug: "amazon-river-to-brazil", start: "Amazon River", target: "Brazil", difficulty: "easy", category: "Geography" },
  { slug: "yoga-to-india", start: "Yoga", target: "India", difficulty: "easy", category: "Culture" },
  { slug: "chocolate-to-mexico", start: "Chocolate", target: "Mexico", difficulty: "easy", category: "Food" },
  { slug: "safari-to-kenya", start: "Safari", target: "Kenya", difficulty: "easy", category: "Animals" },
  { slug: "ballet-to-russia", start: "Ballet", target: "Russia", difficulty: "easy", category: "Art" },
  { slug: "guitar-to-blues", start: "Guitar", target: "Blues", difficulty: "easy", category: "Music" },
  { slug: "volcano-to-hawaii", start: "Volcano", target: "Hawaii", difficulty: "easy", category: "Geography" },
  { slug: "penguin-to-antarctica", start: "Penguin", target: "Antarctica", difficulty: "easy", category: "Animals" },
  { slug: "tea-to-china", start: "Tea", target: "China", difficulty: "easy", category: "Food" },
  { slug: "pyramid-to-giza", start: "Pyramid", target: "Giza pyramid complex", difficulty: "easy", category: "History" },
  { slug: "soccer-to-world-cup", start: "Association football", target: "FIFA World Cup", difficulty: "easy", category: "Sports" },
  { slug: "harry-potter-to-london", start: "Harry Potter", target: "London", difficulty: "easy", category: "Literature" },
  { slug: "statue-of-liberty-to-new-york", start: "Statue of Liberty", target: "New York City", difficulty: "easy", category: "Geography" },
  { slug: "kangaroo-to-australia", start: "Kangaroo", target: "Australia", difficulty: "easy", category: "Animals" },
  { slug: "colosseum-to-rome", start: "Colosseum", target: "Rome", difficulty: "easy", category: "History" },

  // —— Medium (a few hops across domains) ——
  {
    slug: "genghis-khan-to-general-grievous",
    start: "Genghis Khan",
    target: "General Grievous",
    difficulty: "medium",
    category: "Pop Culture",
    featured: true,
  },
  { slug: "einstein-to-minecraft", start: "Albert Einstein", target: "Minecraft", difficulty: "medium", category: "Science" },
  { slug: "nairobi-to-moon", start: "Nairobi", target: "Moon", difficulty: "medium", category: "Geography" },
  { slug: "taylor-swift-to-einstein", start: "Taylor Swift", target: "Albert Einstein", difficulty: "medium", category: "Music" },
  { slug: "beethoven-to-hip-hop", start: "Ludwig van Beethoven", target: "Hip-hop", difficulty: "medium", category: "Music" },
  { slug: "ada-lovelace-to-internet", start: "Ada Lovelace", target: "Internet", difficulty: "medium", category: "Technology" },
  { slug: "spongebob-to-pacific", start: "SpongeBob SquarePants", target: "Pacific Ocean", difficulty: "medium", category: "Television" },
  { slug: "marie-curie-to-nuclear-weapon", start: "Marie Curie", target: "Nuclear weapon", difficulty: "medium", category: "Science" },
  { slug: "shakespeare-to-broadway", start: "William Shakespeare", target: "Broadway theatre", difficulty: "medium", category: "Literature" },
  { slug: "chess-to-cold-war", start: "Chess", target: "Cold War", difficulty: "medium", category: "Sports" },
  { slug: "everest-to-olympics", start: "Mount Everest", target: "Olympic Games", difficulty: "medium", category: "Geography" },
  { slug: "reggae-to-united-nations", start: "Reggae", target: "United Nations", difficulty: "medium", category: "Music" },
  { slug: "tesla-to-electric-car", start: "Nikola Tesla", target: "Electric car", difficulty: "medium", category: "Technology" },
  { slug: "cleopatra-to-perfume", start: "Cleopatra", target: "Perfume", difficulty: "medium", category: "History" },
  { slug: "batman-to-gothic-architecture", start: "Batman", target: "Gothic architecture", difficulty: "medium", category: "Pop Culture" },
  { slug: "beyonce-to-houston", start: "Beyoncé", target: "Houston", difficulty: "medium", category: "Music" },
  { slug: "darwin-to-galapagos", start: "Charles Darwin", target: "Galápagos Islands", difficulty: "medium", category: "Science" },
  { slug: "napoleon-to-waterloo", start: "Napoleon", target: "Battle of Waterloo", difficulty: "medium", category: "History" },
  { slug: "disney-to-animation", start: "The Walt Disney Company", target: "Animation", difficulty: "medium", category: "Pop Culture" },
  { slug: "plato-to-university", start: "Plato", target: "University", difficulty: "medium", category: "Philosophy" },
  { slug: "samba-to-carnival", start: "Samba", target: "Brazilian Carnival", difficulty: "medium", category: "Music" },
  { slug: "titanic-to-iceberg", start: "Titanic", target: "Iceberg", difficulty: "medium", category: "History" },
  { slug: "frida-kahlo-to-mexico-city", start: "Frida Kahlo", target: "Mexico City", difficulty: "medium", category: "Art" },
  { slug: "pele-to-brazil", start: "Pelé", target: "Brazil", difficulty: "medium", category: "Sports" },
  { slug: "sherlock-holmes-to-london", start: "Sherlock Holmes", target: "London", difficulty: "medium", category: "Literature" },
  { slug: "mars-to-elon-musk", start: "Mars", target: "Elon Musk", difficulty: "medium", category: "Science" },
  { slug: "jazz-to-new-orleans", start: "Jazz", target: "New Orleans", difficulty: "medium", category: "Music" },
  { slug: "samurai-to-playstation", start: "Samurai", target: "PlayStation", difficulty: "medium", category: "History" },
  { slug: "great-wall-to-tourism", start: "Great Wall of China", target: "Tourism", difficulty: "medium", category: "Geography" },
  { slug: "oprah-to-chicago", start: "Oprah Winfrey", target: "Chicago", difficulty: "medium", category: "Television" },
  { slug: "lego-to-denmark", start: "Lego", target: "Denmark", difficulty: "medium", category: "Toys" },
  { slug: "sushi-to-pacific", start: "Sushi", target: "Pacific Ocean", difficulty: "medium", category: "Food" },
  { slug: "gandhi-to-civil-rights", start: "Mahatma Gandhi", target: "Civil rights movement", difficulty: "medium", category: "History" },
  { slug: "pokemon-to-japan", start: "Pokémon", target: "Japan", difficulty: "medium", category: "Video Games" },
  { slug: "venice-to-flood", start: "Venice", target: "Flood", difficulty: "medium", category: "Geography" },
  { slug: "hip-hop-to-bronx", start: "Hip-hop", target: "The Bronx", difficulty: "medium", category: "Music" },

  // —— Hard (distant domains, still findable) ——
  { slug: "pizza-to-spacex", start: "Pizza", target: "SpaceX", difficulty: "hard", category: "Food" },
  { slug: "michael-jackson-to-black-hole", start: "Michael Jackson", target: "Black hole", difficulty: "hard", category: "Music" },
  { slug: "minecraft-to-ancient-rome", start: "Minecraft", target: "Ancient Rome", difficulty: "hard", category: "Video Games" },
  { slug: "quantum-to-batman", start: "Quantum mechanics", target: "Batman", difficulty: "hard", category: "Science" },
  { slug: "newton-to-spongebob", start: "Isaac Newton", target: "SpongeBob SquarePants", difficulty: "hard", category: "Pop Culture" },
  { slug: "egypt-to-internet", start: "Ancient Egypt", target: "Internet", difficulty: "hard", category: "History" },
  { slug: "van-gogh-to-bitcoin", start: "Vincent van Gogh", target: "Bitcoin", difficulty: "hard", category: "Art" },
  { slug: "hamster-to-iss", start: "Hamster", target: "International Space Station", difficulty: "hard", category: "Animals" },
  { slug: "avocado-to-silicon-valley", start: "Avocado", target: "Silicon Valley", difficulty: "hard", category: "Food" },
  { slug: "vikings-to-bluetooth", start: "Vikings", target: "Bluetooth", difficulty: "hard", category: "History" },
  { slug: "ballet-to-nuclear-fusion", start: "Ballet", target: "Nuclear fusion", difficulty: "hard", category: "Art" },
  { slug: "kimchi-to-korean-war", start: "Kimchi", target: "Korean War", difficulty: "hard", category: "Food" },
  { slug: "koala-to-olympics", start: "Koala", target: "Olympic Games", difficulty: "hard", category: "Animals" },
  { slug: "frankenstein-to-ai", start: "Frankenstein", target: "Artificial intelligence", difficulty: "hard", category: "Literature" },
  { slug: "reggae-to-bitcoin", start: "Reggae", target: "Bitcoin", difficulty: "hard", category: "Music" },
  { slug: "sahara-to-smartphone", start: "Sahara", target: "Smartphone", difficulty: "hard", category: "Geography" },
  { slug: "plato-to-x", start: "Plato", target: "X (social network)", difficulty: "hard", category: "Philosophy" },
  { slug: "tango-to-antarctica", start: "Tango", target: "Antarctica", difficulty: "hard", category: "Music" },
  { slug: "ikea-to-viking-age", start: "IKEA", target: "Viking Age", difficulty: "hard", category: "Business" },
  { slug: "coffee-to-space-race", start: "Coffee", target: "Space Race", difficulty: "hard", category: "Food" },
  { slug: "zelda-to-medieval", start: "The Legend of Zelda", target: "Middle Ages", difficulty: "hard", category: "Video Games" },
  { slug: "sushi-to-manhattan-project", start: "Sushi", target: "Manhattan Project", difficulty: "hard", category: "Food" },
  { slug: "marilyn-monroe-to-dna", start: "Marilyn Monroe", target: "DNA", difficulty: "hard", category: "Pop Culture" },
  { slug: "machu-picchu-to-youtube", start: "Machu Picchu", target: "YouTube", difficulty: "hard", category: "Geography" },
  { slug: "beethoven-to-mp3", start: "Ludwig van Beethoven", target: "MP3", difficulty: "hard", category: "Music" },
  { slug: "octopus-to-submarine", start: "Octopus", target: "Submarine", difficulty: "hard", category: "Animals" },
  { slug: "guernica-to-nato", start: "Guernica (Picasso)", target: "NATO", difficulty: "hard", category: "Art" },
  { slug: "papyrus-to-javascript", start: "Papyrus", target: "JavaScript", difficulty: "hard", category: "History" },
  { slug: "hockey-to-aurora", start: "Ice hockey", target: "Aurora", difficulty: "hard", category: "Sports" },
  { slug: "confucius-to-silicon", start: "Confucius", target: "Silicon", difficulty: "hard", category: "Philosophy" },
  { slug: "cacao-to-wall-street", start: "Cocoa bean", target: "Wall Street", difficulty: "hard", category: "Food" },
  { slug: "dracula-to-transylvania", start: "Dracula", target: "Transylvania", difficulty: "hard", category: "Literature" },
  { slug: "yoga-to-quantum", start: "Yoga", target: "Quantum mechanics", difficulty: "hard", category: "Culture" },
  { slug: "lego-to-architecture", start: "Lego", target: "Architecture", difficulty: "hard", category: "Toys" },
  { slug: "samba-to-climate-change", start: "Samba", target: "Climate change", difficulty: "hard", category: "Music" },

  // —— Extra hard (`extreme`) — sparse, weird, long paths ——
  { slug: "photosynthesis-to-formula-one", start: "Photosynthesis", target: "Formula One", difficulty: "extreme", category: "Science" },
  { slug: "origami-to-cern", start: "Origami", target: "CERN", difficulty: "extreme", category: "Art" },
  { slug: "bagel-to-black-hole", start: "Bagel", target: "Black hole", difficulty: "extreme", category: "Food" },
  { slug: "knitting-to-kubernetes", start: "Knitting", target: "Kubernetes", difficulty: "extreme", category: "Crafts" },
  { slug: "platypus-to-plato", start: "Platypus", target: "Plato", difficulty: "extreme", category: "Animals" },
  { slug: "harmonica-to-hadron", start: "Harmonica", target: "Hadron", difficulty: "extreme", category: "Music" },
  { slug: "mayonnaise-to-mars-rover", start: "Mayonnaise", target: "Mars rover", difficulty: "extreme", category: "Food" },
  { slug: "yo-yo-to-nanotechnology", start: "Yo-yo", target: "Nanotechnology", difficulty: "extreme", category: "Toys" },
  { slug: "hibiscus-to-higgs-boson", start: "Hibiscus", target: "Higgs boson", difficulty: "extreme", category: "Science" },
  { slug: "ukulele-to-uranium", start: "Ukulele", target: "Uranium", difficulty: "extreme", category: "Music" },
  { slug: "dumpling-to-dark-matter", start: "Dumpling", target: "Dark matter", difficulty: "extreme", category: "Food" },
  { slug: "crossword-to-crispr", start: "Crossword", target: "CRISPR", difficulty: "extreme", category: "Games" },
  { slug: "flamingo-to-fortran", start: "Flamingo", target: "Fortran", difficulty: "extreme", category: "Animals" },
  { slug: "soap-to-supernova", start: "Soap", target: "Supernova", difficulty: "extreme", category: "Science" },
  { slug: "jigsaw-puzzle-to-jupiter", start: "Jigsaw puzzle", target: "Jupiter", difficulty: "extreme", category: "Games" },
  { slug: "pretzel-to-pulsar", start: "Pretzel", target: "Pulsar", difficulty: "extreme", category: "Food" },
  { slug: "origami-to-osiris", start: "Origami", target: "Osiris", difficulty: "extreme", category: "Art" },
  { slug: "accordion-to-asteroid", start: "Accordion", target: "Asteroid", difficulty: "extreme", category: "Music" },
  { slug: "waffle-to-wormhole", start: "Waffle", target: "Wormhole", difficulty: "extreme", category: "Food" },
  { slug: "hamster-to-hubble", start: "Hamster", target: "Hubble Space Telescope", difficulty: "extreme", category: "Animals" },
  { slug: "calligraphy-to-calculus", start: "Calligraphy", target: "Calculus", difficulty: "extreme", category: "Art" },
  { slug: "pickle-to-pluto", start: "Pickled cucumber", target: "Pluto", difficulty: "extreme", category: "Food" },
  { slug: "kazoo-to-quasar", start: "Kazoo", target: "Quasar", difficulty: "extreme", category: "Music" },
  { slug: "sock-to-sodium", start: "Sock", target: "Sodium", difficulty: "extreme", category: "Culture" },
  { slug: "balloon-to-bacteria", start: "Balloon", target: "Bacteria", difficulty: "extreme", category: "Science" },
  { slug: "dominoes-to-dopamine", start: "Dominoes", target: "Dopamine", difficulty: "extreme", category: "Games" },
  { slug: "cactus-to-compiler", start: "Cactus", target: "Compiler", difficulty: "extreme", category: "Science" },
  { slug: "lollipop-to-lithium", start: "Lollipop", target: "Lithium", difficulty: "extreme", category: "Food" },
  { slug: "marionette-to-mitochondria", start: "Marionette", target: "Mitochondria", difficulty: "extreme", category: "Art" },
  { slug: "boomerang-to-boolean", start: "Boomerang", target: "Boolean algebra", difficulty: "extreme", category: "Culture" },
  { slug: "hummus-to-helium", start: "Hummus", target: "Helium", difficulty: "extreme", category: "Food" },
  { slug: "tambourine-to-turing", start: "Tambourine", target: "Alan Turing", difficulty: "extreme", category: "Music" },
];

export const CHALLENGES: Challenge[] = SEEDS;

const HOME_SLUGS = [
  "genghis-khan-to-general-grievous",
  "einstein-to-minecraft",
  "cleopatra-to-hollywood",
  "pizza-to-spacex",
  "newton-to-spongebob",
  "origami-to-cern",
];

export const BEGINNER =
  CHALLENGES.find((challenge) => challenge.beginner) ?? CHALLENGES[0];

export const FEATURED =
  CHALLENGES.find((challenge) => challenge.featured) ?? CHALLENGES[0];

export const HOME_CHALLENGES = HOME_SLUGS.flatMap((slug) => {
  const challenge = CHALLENGES.find((item) => item.slug === slug);
  return challenge ? [challenge] : [];
});

export const CATEGORIES = [...new Set(CHALLENGES.map((challenge) => challenge.category))].sort(
  (a, b) => a.localeCompare(b),
);

export function challengesByDifficulty() {
  return DIFFICULTIES.map((difficulty) => ({
    difficulty,
    challenges: CHALLENGES.filter((challenge) => challenge.difficulty === difficulty),
  }));
}

export function findChallenge(slug: string) {
  return CHALLENGES.find((challenge) => challenge.slug === slug);
}

export function findChallengeByPair(start: string, target: string) {
  return CHALLENGES.find(
    (challenge) => titlesMatch(challenge.start, start) && titlesMatch(challenge.target, target),
  );
}

export function isDifficulty(value: string): value is Difficulty {
  return DIFFICULTIES.includes(value as Difficulty);
}

export function pickQuickChallenge(excludeSlug?: string) {
  const pool = CHALLENGES.filter(
    (challenge) =>
      (challenge.difficulty === "easy" || challenge.difficulty === "medium") &&
      challenge.slug !== excludeSlug,
  );
  const source = pool.length > 0 ? pool : CHALLENGES;
  const index = Math.floor(Math.random() * source.length);
  return source[index] ?? CHALLENGES[0];
}
