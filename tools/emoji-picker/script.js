// Unicode Emoji Picker & Search Suite Logic

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('emoji-search-input');
  const btnClearSearch = document.getElementById('btn-clear-search');
  const categoryPills = document.querySelectorAll('.category-pill');
  const categoryHeading = document.getElementById('category-heading');
  const emojiCountBadge = document.getElementById('emoji-count-badge');
  const emojiGrid = document.getElementById('emoji-grid');
  const recentsList = document.getElementById('recents-list');
  const inspectGlyph = document.getElementById('inspect-glyph');
  const inspectName = document.getElementById('inspect-name');
  const inspectCode = document.getElementById('inspect-code');
  const btnCopyInspected = document.getElementById('btn-copy-inspected');

  // Categorized emoji database
  const emojiData = [
    // Smileys & Emotion
    { char: '😀', name: 'Grinning Face', cat: 'smileys', tags: 'smile happy joy face' },
    { char: '😃', name: 'Grinning Face Big Eyes', cat: 'smileys', tags: 'happy joy excited' },
    { char: '😄', name: 'Grinning Face Smiling Eyes', cat: 'smileys', tags: 'happy joy laugh' },
    { char: '😁', name: 'Beaming Face', cat: 'smileys', tags: 'smile grin happy' },
    { char: '😆', name: 'Grinning Squinting Face', cat: 'smileys', tags: 'laugh hilarious haha' },
    { char: '😅', name: 'Grinning Face Sweat', cat: 'smileys', tags: 'relief phew nervous' },
    { char: '🤣', name: 'Rolling on Floor Laughing', cat: 'smileys', tags: 'rofl lol haha funny' },
    { char: '😂', name: 'Face with Tears of Joy', cat: 'smileys', tags: 'cry happy lol tears' },
    { char: '🙂', name: 'Slightly Smiling Face', cat: 'smileys', tags: 'smile positive' },
    { char: '🙃', name: 'Upside-Down Face', cat: 'smileys', tags: 'silly sarcasm ironic' },
    { char: '😉', name: 'Winking Face', cat: 'smileys', tags: 'wink flirt playful' },
    { char: '😊', name: 'Smiling Face with Smiling Eyes', cat: 'smileys', tags: 'blush warm happy' },
    { char: '😇', name: 'Smiling Face with Halo', cat: 'smileys', tags: 'angel innocent holy' },
    { char: '🥰', name: 'Smiling Face with Hearts', cat: 'smileys', tags: 'love adore affection' },
    { char: '😍', name: 'Heart Eyes', cat: 'smileys', tags: 'love crush beautiful' },
    { char: '🤩', name: 'Star-Struck', cat: 'smileys', tags: 'wow amazing celebrity' },
    { char: '😘', name: 'Face Blowing a Kiss', cat: 'smileys', tags: 'kiss love affection' },
    { char: '😋', name: 'Face Savoring Food', cat: 'smileys', tags: 'delicious yum taste' },
    { char: '😛', name: 'Face with Tongue', cat: 'smileys', tags: 'playful silly tease' },
    { char: '😜', name: 'Winking Face with Tongue', cat: 'smileys', tags: 'crazy playful party' },
    { char: '🤪', name: 'Zany Face', cat: 'smileys', tags: 'wild silly crazy' },
    { char: '🤑', name: 'Money-Mouth Face', cat: 'smileys', tags: 'rich cash dollar wealthy' },
    { char: '🤗', name: 'Hugging Face', cat: 'smileys', tags: 'hug warm embrace' },
    { char: '🤫', name: 'Shushing Face', cat: 'smileys', tags: 'quiet secret silent shh' },
    { char: '🤔', name: 'Thinking Face', cat: 'smileys', tags: 'ponder wonder consider' },
    { char: '🤐', name: 'Zipper-Mouth Face', cat: 'smileys', tags: 'silent secret mute' },
    { char: '🤨', name: 'Face with Raised Eyebrow', cat: 'smileys', tags: 'skeptical distrust doubt' },
    { char: '😐', name: 'Neutral Face', cat: 'smileys', tags: 'meh blank straight' },
    { char: '😑', name: 'Expressionless Face', cat: 'smileys', tags: 'unimpressed deadpan' },
    { char: '😶', name: 'Face Without Mouth', cat: 'smileys', tags: 'silent speech speechless' },
    { char: '😏', name: 'Smirking Face', cat: 'smileys', tags: 'smug flirt sly' },
    { char: '😒', name: 'Unamused Face', cat: 'smileys', tags: 'annoyed bored unimpressed' },
    { char: '🙄', name: 'Face with Rolling Eyes', cat: 'smileys', tags: 'eye roll sarcastic whatever' },
    { char: '😬', name: 'Grimacing Face', cat: 'smileys', tags: 'awkward nervous yikes' },
    { char: '🤥', name: 'Lying Face', cat: 'smileys', tags: 'liar pinocchio false' },
    { char: '😌', name: 'Relieved Face', cat: 'smileys', tags: 'phew calm peaceful' },
    { char: '😔', name: 'Pensive Face', cat: 'smileys', tags: 'sad thoughtful regret' },
    { char: '😪', name: 'Sleepy Face', cat: 'smileys', tags: 'tired droop snot' },
    { char: '🤤', name: 'Drooling Face', cat: 'smileys', tags: 'delicious hungry craving' },
    { char: '😴', name: 'Sleeping Face', cat: 'smileys', tags: 'sleep zzz bedtime' },
    { char: '😷', name: 'Face with Medical Mask', cat: 'smileys', tags: 'sick health flu virus' },
    { char: '🤒', name: 'Face with Thermometer', cat: 'smileys', tags: 'sick fever cold illness' },
    { char: '🤕', name: 'Face with Head-Bandage', cat: 'smileys', tags: 'hurt injury accident' },
    { char: '🤢', name: 'Nauseated Face', cat: 'smileys', tags: 'gross disgust vomit' },
    { char: '🤮', name: 'Face Vomiting', cat: 'smileys', tags: 'sick throw up disgust' },
    { char: '🥵', name: 'Hot Face', cat: 'smileys', tags: 'heat warm sweat fever' },
    { char: '🥶', name: 'Cold Face', cat: 'smileys', tags: 'freeze ice winter chilly' },
    { char: '🤯', name: 'Exploding Head', cat: 'smileys', tags: 'mind blown shock amazed' },
    { char: '🥳', name: 'Partying Face', cat: 'smileys', tags: 'celebrate birthday cheer' },
    { char: '😎', name: 'Smiling Face with Sunglasses', cat: 'smileys', tags: 'cool shades boss confident' },
    { char: '🤓', name: 'Nerd Face', cat: 'smileys', tags: 'geek smart glasses study' },
    { char: '🧐', name: 'Face with Monocle', cat: 'smileys', tags: 'curious examine investigate' },
    { char: '😕', name: 'Slightly Frowning Face', cat: 'smileys', tags: 'disappointed unhappy' },
    { char: '😟', name: 'Worried Face', cat: 'smileys', tags: 'anxious nervous fret' },
    { char: '🙁', name: 'Frowning Face', cat: 'smileys', tags: 'sad grief gloom' },
    { char: '😮', name: 'Face with Open Mouth', cat: 'smileys', tags: 'surprise wow shock' },
    { char: '😯', name: 'Hushed Face', cat: 'smileys', tags: 'surprise quiet awe' },
    { char: '😲', name: 'Astonished Face', cat: 'smileys', tags: 'shock stunned amazed' },
    { char: '😳', name: 'Flushed Face', cat: 'smileys', tags: 'blush shy embarrassed' },
    { char: '🥺', name: 'Pleading Face', cat: 'smileys', tags: 'beg puppy eyes please' },
    { char: '😦', name: 'Frowning Face with Open Mouth', cat: 'smileys', tags: 'gasp dismay' },
    { char: '😧', name: 'Anguished Face', cat: 'smileys', tags: 'pain sorrow stun' },
    { char: '😨', name: 'Fearful Face', cat: 'smileys', tags: 'scared terrified panic' },
    { char: '😰', name: 'Anxious Face with Sweat', cat: 'smileys', tags: 'nervous worry blue' },
    { char: '😥', name: 'Sad but Relieved Face', cat: 'smileys', tags: 'close call phew sorrow' },
    { char: '😢', name: 'Crying Face', cat: 'smileys', tags: 'tear sad upset weep' },
    { char: '😭', name: 'Loudly Crying Face', cat: 'smileys', tags: 'sob sorrow heart broken' },
    { char: '😱', name: 'Face Screaming in Fear', cat: 'smileys', tags: 'horror scream munch terrified' },
    { char: '😖', name: 'Confounded Face', cat: 'smileys', tags: 'confused frustration quivering' },
    { char: '😣', name: 'Persevering Face', cat: 'smileys', tags: 'struggle endure strain' },
    { char: '😞', name: 'Disappointed Face', cat: 'smileys', tags: 'sad letdown regret' },
    { char: '😓', name: 'Downcast Face with Sweat', cat: 'smileys', tags: 'exhausted defeated hard' },
    { char: '😩', name: 'Weary Face', cat: 'smileys', tags: 'tired distressed frustrated' },
    { char: '😫', name: 'Tired Face', cat: 'smileys', tags: 'exhausted overwhelmed fed up' },
    { char: '🥱', name: 'Yawning Face', cat: 'smileys', tags: 'tired sleepy bored yawn' },
    { char: '😤', name: 'Face with Steam from Nose', cat: 'smileys', tags: 'triumph huff determined pride' },
    { char: '😡', name: 'Pouting Face (Enraged)', cat: 'smileys', tags: 'angry mad red fury' },
    { char: '😠', name: 'Angry Face', cat: 'smileys', tags: 'mad grr furious rage' },
    { char: '🤬', name: 'Face with Symbols on Mouth', cat: 'smileys', tags: 'swearing curse profanity rage' },
    { char: '😈', name: 'Smiling Face with Horns', cat: 'smileys', tags: 'devil evil mischief bad' },
    { char: '👿', name: 'Angry Face with Horns', cat: 'smileys', tags: 'devil imp demonic wrath' },
    { char: '💀', name: 'Skull', cat: 'smileys', tags: 'dead skeleton death hilarious' },
    { char: '💩', name: 'Pile of Poo', cat: 'smileys', tags: 'poop crap funny stinky' },
    { char: '🤡', name: 'Clown Face', cat: 'smileys', tags: 'circus fool foolish' },
    { char: '👻', name: 'Ghost', cat: 'smileys', tags: 'spooky halloween spirit phantom' },
    { char: '👽', name: 'Alien', cat: 'smileys', tags: 'ufo extraterrestrial space mars' },
    { char: '🤖', name: 'Robot', cat: 'smileys', tags: 'bot artificial intelligence automation' },

    // People & Body
    { char: '👋', name: 'Waving Hand', cat: 'people', tags: 'hello hi goodbye wave' },
    { char: '🤚', name: 'Raised Back of Hand', cat: 'people', tags: 'hand back stop' },
    { char: '🖐️', name: 'Hand with Fingers Splayed', cat: 'people', tags: 'five high five palm' },
    { char: '✋', name: 'Raised Hand', cat: 'people', tags: 'high five stop question' },
    { char: '🖖', name: 'Vulcan Salute', cat: 'people', tags: 'spock star trek live long' },
    { char: '👌', name: 'OK Hand', cat: 'people', tags: 'okay perfect fine good' },
    { char: '🤌', name: 'Pinched Fingers', cat: 'people', tags: 'italian gesture what do you want' },
    { char: '🤏', name: 'Pinching Hand', cat: 'people', tags: 'small little tiny bit' },
    { char: '✌️', name: 'Victory Hand', cat: 'people', tags: 'peace two win v' },
    { char: '🤞', name: 'Crossed Fingers', cat: 'people', tags: 'luck hope wish good' },
    { char: '🤟', name: 'Love-You Gesture', cat: 'people', tags: 'ily rock love hand' },
    { char: '🤘', name: 'Sign of the Horns', cat: 'people', tags: 'rock heavy metal concert' },
    { char: '🤙', name: 'Call Me Hand', cat: 'people', tags: 'shaka phone hang loose' },
    { char: '👈', name: 'Backhand Index Pointing Left', cat: 'people', tags: 'point left direction' },
    { char: '👉', name: 'Backhand Index Pointing Right', cat: 'people', tags: 'point right direction' },
    { char: '👆', name: 'Backhand Index Pointing Up', cat: 'people', tags: 'point up top above' },
    { char: '👇', name: 'Backhand Index Pointing Down', cat: 'people', tags: 'point down bottom below' },
    { char: '☝️', name: 'Index Pointing Up', cat: 'people', tags: 'one number attention' },
    { char: '👍', name: 'Thumbs Up', cat: 'people', tags: 'yes agree approve great good' },
    { char: '👎', name: 'Thumbs Down', cat: 'people', tags: 'no dislike disapprove bad' },
    { char: '✊', name: 'Raised Fist', cat: 'people', tags: 'power strength solidarity' },
    { char: '👊', name: 'Oncoming Fist', cat: 'people', tags: 'fist bump punch bro' },
    { char: '🤛', name: 'Left-Facing Fist', cat: 'people', tags: 'fist bump pound' },
    { char: '🤜', name: 'Right-Facing Fist', cat: 'people', tags: 'fist bump pound' },
    { char: '👏', name: 'Clapping Hands', cat: 'people', tags: 'applause bravo praise congrats' },
    { char: '🙌', name: 'Raising Hands', cat: 'people', tags: 'celebrate praise yay hooray' },
    { char: '👐', name: 'Open Hands', cat: 'people', tags: 'open hug embrace jazz' },
    { char: '🤲', name: 'Palms Up Together', cat: 'people', tags: 'prayer duaa offering' },
    { char: '🤝', name: 'Handshake', cat: 'people', tags: 'deal agreement partner meeting' },
    { char: '🙏', name: 'Folded Hands', cat: 'people', tags: 'pray please thank you namaste' },
    { char: '💪', name: 'Flexed Biceps', cat: 'people', tags: 'muscle strength power gym workout' },
    { char: '🧠', name: 'Brain', cat: 'people', tags: 'smart intellect mind think' },
    { char: '👀', name: 'Eyes', cat: 'people', tags: 'look glance see watch look' },
    { char: '👁️', name: 'Eye', cat: 'people', tags: 'look vision see gaze' },

    // Animals & Nature
    { char: '🐶', name: 'Dog Face', cat: 'animals', tags: 'pet puppy canine bark' },
    { char: '🐱', name: 'Cat Face', cat: 'animals', tags: 'pet kitten meow feline' },
    { char: '🐭', name: 'Mouse Face', cat: 'animals', tags: 'rodent cheese squeak' },
    { char: '🐹', name: 'Hamster Face', cat: 'animals', tags: 'pet cute rodent' },
    { char: '🐰', name: 'Rabbit Face', cat: 'animals', tags: 'bunny cute easter' },
    { char: '🦊', name: 'Fox', cat: 'animals', tags: 'clever wild animal' },
    { char: '🐻', name: 'Bear Face', cat: 'animals', tags: 'grizzly wild woods teddy' },
    { char: '🐼', name: 'Panda Face', cat: 'animals', tags: 'bamboo china cute bear' },
    { char: '🐨', name: 'Koala', cat: 'animals', tags: 'australia cute marsupial' },
    { char: '🐯', name: 'Tiger Face', cat: 'animals', tags: 'wild predator cat stripes' },
    { char: '🦁', name: 'Lion', cat: 'animals', tags: 'king jungle predator roar' },
    { char: '🐮', name: 'Cow Face', cat: 'animals', tags: 'farm milk beef moo' },
    { char: '🐷', name: 'Pig Face', cat: 'animals', tags: 'farm pork oink piggy' },
    { char: '🐸', name: 'Frog', cat: 'animals', tags: 'toad amphibian green ribbit' },
    { char: '🐵', name: 'Monkey Face', cat: 'animals', tags: 'ape playful banana jungle' },
    { char: '🐔', name: 'Chicken', cat: 'animals', tags: 'bird poultry farm rooster' },
    { char: '🐧', name: 'Penguin', cat: 'animals', tags: 'antarctic cold bird tux' },
    { char: '🐦', name: 'Bird', cat: 'animals', tags: 'tweet fly chirp feather' },
    { char: '🦅', name: 'Eagle', cat: 'animals', tags: 'raptor bird america freedom predator' },
    { char: '🦆', name: 'Duck', cat: 'animals', tags: 'quack waterfowl pond' },
    { char: '🦉', name: 'Owl', cat: 'animals', tags: 'wise night nocturnal bird' },
    { char: '🦇', name: 'Bat', cat: 'animals', tags: 'vampire night caves mammal' },
    { char: '🐺', name: 'Wolf', cat: 'animals', tags: 'howl pack wild animal' },
    { char: '🐴', name: 'Horse Face', cat: 'animals', tags: 'stallion ride farm gallop' },
    { char: '🦄', name: 'Unicorn', cat: 'animals', tags: 'magic fantasy horn rainbow' },
    { char: '🐝', name: 'Honeybee', cat: 'animals', tags: 'insect bug honey sting flower' },
    { char: '🐛', name: 'Bug', cat: 'animals', tags: 'caterpillar insect nature creep' },
    { char: '🦋', name: 'Butterfly', cat: 'animals', tags: 'insect beauty wings flutter' },
    { char: '🐌', name: 'Snail', cat: 'animals', tags: 'slow shell garden slime' },
    { char: '🐞', name: 'Lady Beetle', cat: 'animals', tags: 'ladybug insect luck red dots' },
    { char: '🐢', name: 'Turtle', cat: 'animals', tags: 'tortoise slow reptile green shell' },
    { char: '🐍', name: 'Snake', cat: 'animals', tags: 'reptile serpent hiss poison venom' },
    { char: '🐙', name: 'Octopus', cat: 'animals', tags: 'ocean sea tentacle marine' },
    { char: '🐬', name: 'Dolphin', cat: 'animals', tags: 'ocean mammal marine smart' },
    { char: '🐳', name: 'Spouting Whale', cat: 'animals', tags: 'ocean giant sea blowhole' },
    { char: '🐟', name: 'Fish', cat: 'animals', tags: 'sea ocean swim fresh' },
    { char: '🦈', name: 'Shark', cat: 'animals', tags: 'predator ocean sea jaws' },
    { char: '🌸', name: 'Cherry Blossom', cat: 'animals', tags: 'flower pink spring sakura plant' },
    { char: '🌹', name: 'Rose', cat: 'animals', tags: 'flower love romantic red petals' },
    { char: '🌻', name: 'Sunflower', cat: 'animals', tags: 'flower sunny yellow summer plant' },
    { char: '🌲', name: 'Evergreen Tree', cat: 'animals', tags: 'nature pine forest woods' },
    { char: '🌴', name: 'Palm Tree', cat: 'animals', tags: 'tropical beach summer island' },
    { char: '🔥', name: 'Fire', cat: 'animals', tags: 'flame hot lit heat burn trending' },
    { char: '⚡', name: 'High Voltage', cat: 'animals', tags: 'lightning bolt electricity power fast' },
    { char: '⭐', name: 'Star', cat: 'animals', tags: 'gold shining sky favorite top' },
    { char: '✨', name: 'Sparkles', cat: 'animals', tags: 'magic sparkle clean shiny star glam' },

    // Food & Drink
    { char: '🍏', name: 'Green Apple', cat: 'food', tags: 'fruit fruit green healthy snack' },
    { char: '🍎', name: 'Red Apple', cat: 'food', tags: 'fruit red healthy orchard' },
    { char: '🍐', name: 'Pear', cat: 'food', tags: 'fruit sweet juicy' },
    { char: '🍊', name: 'Tangerine', cat: 'food', tags: 'orange citrus fruit vitamin c' },
    { char: '🍋', name: 'Lemon', cat: 'food', tags: 'sour yellow citrus juice' },
    { char: '🍌', name: 'Banana', cat: 'food', tags: 'fruit yellow potassium monkey' },
    { char: '🍉', name: 'Watermelon', cat: 'food', tags: 'fruit summer slice sweet seed' },
    { char: '🍇', name: 'Grapes', cat: 'food', tags: 'fruit wine bunch purple' },
    { char: '🍓', name: 'Strawberry', cat: 'food', tags: 'fruit berry sweet red' },
    { char: '🫐', name: 'Blueberries', cat: 'food', tags: 'berry blue fruit antioxidant' },
    { char: '🍒', name: 'Cherries', cat: 'food', tags: 'fruit pair red sweet' },
    { char: '🍑', name: 'Peach', cat: 'food', tags: 'fruit sweet juicy booty' },
    { char: '🥭', name: 'Mango', cat: 'food', tags: 'tropical fruit sweet juicy' },
    { char: '🍍', name: 'Pineapple', cat: 'food', tags: 'tropical fruit sweet spiky' },
    { char: '🥥', name: 'Coconut', cat: 'food', tags: 'tropical palm water nut' },
    { char: '🥝', name: 'Kiwi Fruit', cat: 'food', tags: 'fruit green fuzzy new zealand' },
    { char: '🍅', name: 'Tomato', cat: 'food', tags: 'vegetable fruit red salad' },
    { char: '🥑', name: 'Avocado', cat: 'food', tags: 'guacamole green healthy toast' },
    { char: '🍆', name: 'Eggplant', cat: 'food', tags: 'aubergine vegetable purple' },
    { char: '🥔', name: 'Potato', cat: 'food', tags: 'spud starch fries bake' },
    { char: '🥕', name: 'Carrot', cat: 'food', tags: 'vegetable orange rabbit healthy' },
    { char: '🌽', name: 'Ear of Corn', cat: 'food', tags: 'maize yellow vegetable grain' },
    { char: '🌶️', name: 'Hot Pepper', cat: 'food', tags: 'chili spicy spicy red heat' },
    { char: '🥒', name: 'Cucumber', cat: 'food', tags: 'pickle vegetable green salad' },
    { char: '🥬', name: 'Leafy Green', cat: 'food', tags: 'lettuce salad kale cabbage' },
    { char: '🥦', name: 'Broccoli', cat: 'food', tags: 'vegetable green healthy tree' },
    { char: '🍞', name: 'Bread', cat: 'food', tags: 'loaf bakery toast carbohydrate' },
    { char: '🥐', name: 'Croissant', cat: 'food', tags: 'bakery pastry french butter' },
    { char: '🥖', name: 'Baguette Bread', cat: 'food', tags: 'french bread long bakery' },
    { char: '🥨', name: 'Pretzel', cat: 'food', tags: 'bavarian salty snack twisted' },
    { char: '🥯', name: 'Bagel', cat: 'food', tags: 'bakery breakfast cream cheese' },
    { char: '🥞', name: 'Pancakes', cat: 'food', tags: 'breakfast syrup stack flapjack' },
    { char: '🧇', name: 'Waffle', cat: 'food', tags: 'breakfast grid syrup belgian' },
    { char: '🧀', name: 'Cheese Wedge', cat: 'food', tags: 'dairy yellow cheddar swiss' },
    { char: '🍖', name: 'Meat on Bone', cat: 'food', tags: 'meat barbecue steak protein' },
    { char: '🍗', name: 'Poultry Leg', cat: 'food', tags: 'chicken drumstick fried meat' },
    { char: '🥩', name: 'Cut of Meat', cat: 'food', tags: 'steak beef raw butcher' },
    { char: '🥓', name: 'Bacon', cat: 'food', tags: 'breakfast meat pork crispy' },
    { char: '🍔', name: 'Hamburger', cat: 'food', tags: 'burger fast food beef sandwich' },
    { char: '🍟', name: 'French Fries', cat: 'food', tags: 'fast food potato crispy' },
    { char: '🍕', name: 'Pizza', cat: 'food', tags: 'slice cheese pepperoni italian' },
    { char: '🌭', name: 'Hot Dog', cat: 'food', tags: 'sausage bun mustard fast food' },
    { char: '🥪', name: 'Sandwich', cat: 'food', tags: 'lunch bread deli sub' },
    { char: '🌮', name: 'Taco', cat: 'food', tags: 'mexican shell beef lettuce' },
    { char: '🌯', name: 'Burrito', cat: 'food', tags: 'wrap mexican bean rice' },
    { char: '🍜', name: 'Steaming Bowl', cat: 'food', tags: 'ramen noodles soup broth' },
    { char: '🍝', name: 'Spaghetti', cat: 'food', tags: 'pasta italian noodles sauce' },
    { char: '🍣', name: 'Sushi', cat: 'food', tags: 'japanese fish rice raw' },
    { char: '🍱', name: 'Bento Box', cat: 'food', tags: 'japanese lunch box meal' },
    { char: '🍦', name: 'Soft Ice Cream', cat: 'food', tags: 'dessert sweet dairy cone' },
    { char: '🍩', name: 'Doughnut', cat: 'food', tags: 'donut sweet pastry glaze' },
    { char: '🍪', name: 'Cookie', cat: 'food', tags: 'biscuit chocolate chip sweet' },
    { char: '🎂', name: 'Birthday Cake', cat: 'food', tags: 'celebrate candles dessert party' },
    { char: '🍰', name: 'Shortcake', cat: 'food', tags: 'slice dessert sweet pastry' },
    { char: '🧁', name: 'Cupcake', cat: 'food', tags: 'dessert sweet frosting bakery' },
    { char: '🍫', name: 'Chocolate Bar', cat: 'food', tags: 'sweet candy cacao bar' },
    { char: '🍬', name: 'Candy', cat: 'food', tags: 'sweet sugar treat wrapped' },
    { char: '🍭', name: 'Lollipop', cat: 'food', tags: 'candy sweet sugar suck' },
    { char: '☕', name: 'Hot Beverage', cat: 'food', tags: 'coffee tea warm cup mug espresso' },
    { char: '🍵', name: 'Teacup Without Handle', cat: 'food', tags: 'green tea matcha cup' },
    { char: '🧃', name: 'Beverage Box', cat: 'food', tags: 'juice box straw fruit drink' },
    { char: '🥤', name: 'Cup with Straw', cat: 'food', tags: 'soda drink cup juice fast food' },
    { char: '🧋', name: 'Bubble Tea', cat: 'food', tags: 'boba milk tea tapioca pearls' },

    // Travel & Places
    { char: '✈️', name: 'Airplane', cat: 'travel', tags: 'flight travel trip airline vacation' },
    { char: '🚀', name: 'Rocket', cat: 'travel', tags: 'space blast off launch crypto moon' },
    { char: '🚁', name: 'Helicopter', cat: 'travel', tags: 'rotor fly copter travel' },
    { char: '🚂', name: 'Locomotive', cat: 'travel', tags: 'train railway steam transit' },
    { char: '🚆', name: 'Bullet Train', cat: 'travel', tags: 'high speed train transit railway' },
    { char: '🚗', name: 'Automobile', cat: 'travel', tags: 'car vehicle drive road transport' },
    { char: '🚕', name: 'Taxi', cat: 'travel', tags: 'cab uber transport yellow' },
    { char: '🚙', name: 'SUV', cat: 'travel', tags: 'car vehicle sports utility drive' },
    { char: '🚌', name: 'Bus', cat: 'travel', tags: 'transit public transport school bus' },
    { char: '🚎', name: 'Trolleybus', cat: 'travel', tags: 'electric transit bus wire' },
    { char: '🏎️', name: 'Racing Car', cat: 'travel', tags: 'f1 speed race car fast' },
    { char: '🚓', name: 'Police Car', cat: 'travel', tags: 'cop law emergency vehicle' },
    { char: '🚑', name: 'Ambulance', cat: 'travel', tags: 'medical emergency hospital vehicle' },
    { char: '🚒', name: 'Fire Engine', cat: 'travel', tags: 'fire truck emergency rescue' },
    { char: '🚚', name: 'Delivery Truck', cat: 'travel', tags: 'freight shipping cargo transport' },
    { char: '🚢', name: 'Ship', cat: 'travel', tags: 'boat cruise cargo ocean water' },
    { char: '⛵', name: 'Sailboat', cat: 'travel', tags: 'yacht sea boat sail water' },
    { char: '🗺️', name: 'World Map', cat: 'travel', tags: 'geography travel atlas explore' },
    { char: '🏖️', name: 'Beach with Umbrella', cat: 'travel', tags: 'vacation summer ocean island' },
    { char: '🏝️', name: 'Desert Island', cat: 'travel', tags: 'tropical palm ocean isolated' },
    { char: '🏔️', name: 'Snow-Capped Mountain', cat: 'travel', tags: 'alpine hike peak nature' },
    { char: '🏕️', name: 'Camping', cat: 'travel', tags: 'tent outdoor hike wilderness' },
    { char: '🗽', name: 'Statue of Liberty', cat: 'travel', tags: 'new york usa landmark freedom' },
    { char: '🗼', name: 'Tokyo Tower', cat: 'travel', tags: 'japan landmark travel tower' },
    { char: '🏰', name: 'Castle', cat: 'travel', tags: 'fortress medieval fairy tale disney' },
    { char: '🕋', name: 'Kaaba', cat: 'travel', tags: 'makkah hajj umrah islam mecca' },
    { char: '🕌', name: 'Mosque', cat: 'travel', tags: 'islam minaret masjid prayer' },
    { char: '⛪', name: 'Church', cat: 'travel', tags: 'christianity chapel building cross' },

    // Activities & Sports
    { char: '⚽', name: 'Soccer Ball', cat: 'activities', tags: 'football sport match game kick' },
    { char: '🏀', name: 'Basketball', cat: 'activities', tags: 'hoop sport nba ball' },
    { char: '🏈', name: 'American Football', cat: 'activities', tags: 'nfl superbowl sport touchdown' },
    { char: '⚾', name: 'Baseball', cat: 'activities', tags: 'sport bat mlb ball' },
    { char: '🎾', name: 'Tennis', cat: 'activities', tags: 'racket sport ball match court' },
    { char: '🏐', name: 'Volleyball', cat: 'activities', tags: 'ball sport beach net' },
    { char: '🏉', name: 'Rugby Football', cat: 'activities', tags: 'sport ball try scrum' },
    { char: '🥏', name: 'Flying Disc', cat: 'activities', tags: 'frisbee sport throw catch' },
    { char: '🎱', name: 'Pool 8 Ball', cat: 'activities', tags: 'billiards snooker cue ball eight' },
    { char: '🏓', name: 'Ping Pong', cat: 'activities', tags: 'table tennis paddle ball game' },
    { char: '🏸', name: 'Badminton', cat: 'activities', tags: 'shuttlecock bird racket net' },
    { char: '🥊', name: 'Boxing Glove', cat: 'activities', tags: 'fight punch match ring combat' },
    { char: '🥋', name: 'Martial Arts Uniform', cat: 'activities', tags: 'karate judo taekwondo gi belt' },
    { char: '🎯', name: 'Bullseye', cat: 'activities', tags: 'dart target goal accuracy hit' },
    { char: '🎮', name: 'Video Game Controller', cat: 'activities', tags: 'gaming play playstation xbox nintendo' },
    { char: '🕹️', name: 'Joystick', cat: 'activities', tags: 'arcade game retro control' },
    { char: '🎲', name: 'Game Die', cat: 'activities', tags: 'dice roll board game random luck' },
    { char: '🧩', name: 'Puzzle Piece', cat: 'activities', tags: 'jigsaw puzzle problem solution solve' },
    { char: '🏆', name: 'Trophy', cat: 'activities', tags: 'winner champion prize award gold' },
    { char: '🥇', name: '1st Place Medal', cat: 'activities', tags: 'gold medal winner champion first' },
    { char: '🥈', name: '2nd Place Medal', cat: 'activities', tags: 'silver medal second runner up' },
    { char: '🥉', name: '3rd Place Medal', cat: 'activities', tags: 'bronze medal third place' },
    { char: '🎨', name: 'Artist Palette', cat: 'activities', tags: 'paint art draw color create' },
    { char: '🎬', name: 'Clapper Board', cat: 'activities', tags: 'movie film cinema director take' },
    { char: '🎤', name: 'Microphone', cat: 'activities', tags: 'sing karaoke voice audio podcast' },
    { char: '🎧', name: 'Headphone', cat: 'activities', tags: 'music audio listen sound podcast' },
    { char: '🎸', name: 'Guitar', cat: 'activities', tags: 'music instrument rock acoustic electric' },
    { char: '🎹', name: 'Musical Keyboard', cat: 'activities', tags: 'piano music keys instrument synth' },

    // Objects & Tech
    { char: '💡', name: 'Light Bulb', cat: 'objects', tags: 'idea innovation creative insight genius' },
    { char: '📱', name: 'Mobile Phone', cat: 'objects', tags: 'iphone android smartphone cell call' },
    { char: '💻', name: 'Laptop', cat: 'objects', tags: 'computer macbook pc tech code' },
    { char: '🖥️', name: 'Desktop Computer', cat: 'objects', tags: 'monitor pc screen workstation' },
    { char: '⌨️', name: 'Keyboard', cat: 'objects', tags: 'typing input tech pc mechanical' },
    { char: '🖱️', name: 'Computer Mouse', cat: 'objects', tags: 'click pointer scroll peripheral' },
    { char: '📷', name: 'Camera', cat: 'objects', tags: 'photo picture lens photography snapshot' },
    { char: '📹', name: 'Video Camera', cat: 'objects', tags: 'film record camcorder footage' },
    { char: '🔍', name: 'Magnifying Glass Tilted Left', cat: 'objects', tags: 'search find investigate look' },
    { char: '🔎', name: 'Magnifying Glass Tilted Right', cat: 'objects', tags: 'search zoom look examine' },
    { char: '🔒', name: 'Locked', cat: 'objects', tags: 'padlock security private safe protect' },
    { char: '🔓', name: 'Unlocked', cat: 'objects', tags: 'padlock open access public free' },
    { char: '🔑', name: 'Key', cat: 'objects', tags: 'access secret password security login' },
    { char: '🔨', name: 'Hammer', cat: 'objects', tags: 'tool build repair construction craft' },
    { char: '🛠️', name: 'Hammer and Wrench', cat: 'objects', tags: 'tools settings configure repair dev' },
    { char: '⚙️', name: 'Gear', cat: 'objects', tags: 'settings cog options config machine' },
    { char: '📦', name: 'Package', cat: 'objects', tags: 'box delivery shipping parcel cargo' },
    { char: '✉️', name: 'Envelope', cat: 'objects', tags: 'mail letter message email contact' },
    { char: '📧', name: 'E-Mail', cat: 'objects', tags: 'message communication inbox send' },
    { char: '📝', name: 'Memo', cat: 'objects', tags: 'note write document paper pen' },
    { char: '📄', name: 'Page Facing Up', cat: 'objects', tags: 'document sheet paper file text' },
    { char: '📅', name: 'Calendar', cat: 'objects', tags: 'date schedule day time event' },
    { char: '📊', name: 'Bar Chart', cat: 'objects', tags: 'graph stats analytics growth metrics' },
    { char: '📈', name: 'Chart Increasing', cat: 'objects', tags: 'growth up stocks trend profit success' },
    { char: '📉', name: 'Chart Decreasing', cat: 'objects', tags: 'decline down loss drop recession' },
    { char: '💰', name: 'Money Bag', cat: 'objects', tags: 'dollar cash wealth finance rich' },
    { char: '💳', name: 'Credit Card', cat: 'objects', tags: 'payment bank buy checkout purchase' },

    // Symbols & Math
    { char: '❤️', name: 'Red Heart', cat: 'symbols', tags: 'love affection passion favorite like' },
    { char: '🧡', name: 'Orange Heart', cat: 'symbols', tags: 'love warm friendship' },
    { char: '💛', name: 'Yellow Heart', cat: 'symbols', tags: 'friendship positive joy happiness' },
    { char: '💚', name: 'Green Heart', cat: 'symbols', tags: 'nature eco health peace' },
    { char: '💙', name: 'Blue Heart', cat: 'symbols', tags: 'trust loyalty calm cool' },
    { char: '💜', name: 'Purple Heart', cat: 'symbols', tags: 'luxury royal wealth care' },
    { char: '🖤', name: 'Black Heart', cat: 'symbols', tags: 'dark goth sorrow dark' },
    { char: '🤍', name: 'White Heart', cat: 'symbols', tags: 'pure clean peace spiritual' },
    { char: '💔', name: 'Broken Heart', cat: 'symbols', tags: 'sad breakup grief heartache hurt' },
    { char: '💯', name: 'Hundred Points', cat: 'symbols', tags: '100 perfect score keep it 100 grade' },
    { char: '✅', name: 'Check Mark Button', cat: 'symbols', tags: 'correct approved done verified success yes' },
    { char: '✔️', name: 'Check Mark', cat: 'symbols', tags: 'check tick verified pass ok' },
    { char: '❌', name: 'Cross Mark', cat: 'symbols', tags: 'wrong error no fail cancel reject' },
    { char: '⚠️', name: 'Warning', cat: 'symbols', tags: 'caution alert danger caution risk' },
    { char: '⛔', name: 'No Entry', cat: 'symbols', tags: 'stop forbidden access denied banned' },
    { char: '🚫', name: 'Prohibited', cat: 'symbols', tags: 'no forbidden ban restrict' },
    { char: 'ℹ️', name: 'Information', cat: 'symbols', tags: 'info details help about guide' },
    { char: '❓', name: 'Question Mark', cat: 'symbols', tags: 'help doubt query ask question' },
    { char: '❗', name: 'Exclamation Mark', cat: 'symbols', tags: 'alert attention warn notice priority' },
    { char: '➕', name: 'Plus', cat: 'symbols', tags: 'math add positive increase sum' },
    { char: '➖', name: 'Minus', cat: 'symbols', tags: 'math subtract negative reduce' },
    { char: '✖️', name: 'Multiply', cat: 'symbols', tags: 'math times product math' },
    { char: '➗', name: 'Divide', cat: 'symbols', tags: 'math division slash fraction' },
    { char: '💲', name: 'Heavy Dollar Sign', cat: 'symbols', tags: 'money currency usd cost price' },

    // Flags
    { char: '🏁', name: 'Chequered Flag', cat: 'flags', tags: 'finish race speed competition' },
    { char: '🚩', name: 'Triangular Flag', cat: 'flags', tags: 'red flag marker warning goal' },
    { char: '🎌', name: 'Crossed Flags', cat: 'flags', tags: 'japan celebration holiday' },
    { char: '🏴‍☠️', name: 'Pirate Flag', cat: 'flags', tags: 'jolly roger skull bones sailing' },
    { char: '🏳️‍🌈', name: 'Rainbow Flag', cat: 'flags', tags: 'pride lgbt freedom equality' },
    { char: '🇺🇸', name: 'Flag: United States', cat: 'flags', tags: 'usa america english stars stripes' },
    { char: '🇬🇧', name: 'Flag: United Kingdom', cat: 'flags', tags: 'uk britain union jack london' },
    { char: '🇧🇩', name: 'Flag: Bangladesh', cat: 'flags', tags: 'bangladesh dhaka biman red green' },
    { char: '🇸🇦', name: 'Flag: Saudi Arabia', cat: 'flags', tags: 'saudi arabia riyadh makkah ksa' },
    { char: '🇦🇪', name: 'Flag: United Arab Emirates', cat: 'flags', tags: 'uae dubai abu dhabi emirates' },
    { char: '🇨🇦', name: 'Flag: Canada', cat: 'flags', tags: 'canada maple leaf ottawa' },
    { char: '🇦🇺', name: 'Flag: Australia', cat: 'flags', tags: 'australia sydney canberra' },
    { char: '🇩🇪', name: 'Flag: Germany', cat: 'flags', tags: 'germany berlin deutschland' },
    { char: '🇫🇷', name: 'Flag: France', cat: 'flags', tags: 'france paris tricolor' },
    { char: '🇯🇵', name: 'Flag: Japan', cat: 'flags', tags: 'japan tokyo rising sun nihon' },
    { char: '🇮🇳', name: 'Flag: India', cat: 'flags', tags: 'india delhi tricolor' }
  ];

  let currentCategory = 'all';
  let activeInspectedEmoji = emojiData[0];
  let recents = JSON.parse(localStorage.getItem('recent_emojis_v1') || '[]');

  function saveRecent(emoji) {
    recents = recents.filter(e => e.char !== emoji.char);
    recents.unshift(emoji);
    if (recents.length > 18) recents.pop();
    localStorage.setItem('recent_emojis_v1', JSON.stringify(recents));
    renderRecents();
  }

  function renderRecents() {
    recentsList.innerHTML = '';
    if (recents.length === 0) {
      recentsList.innerHTML = '<span style="font-size: 0.8rem; color: var(--text-tertiary);">Click any emoji below to copy &amp; remember</span>';
      return;
    }
    recents.forEach(r => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'emoji-btn';
      btn.textContent = r.char;
      btn.title = r.name;
      btn.addEventListener('click', () => {
        copyEmoji(r);
      });
      recentsList.appendChild(btn);
    });
  }

  function inspect(emoji) {
    activeInspectedEmoji = emoji;
    inspectGlyph.textContent = emoji.char;
    inspectName.textContent = emoji.name;
    const codePoint = emoji.char.codePointAt(0).toString(16).toUpperCase();
    inspectCode.textContent = `U+${codePoint}`;
  }

  function copyEmoji(emoji) {
    inspect(emoji);
    saveRecent(emoji);
    navigator.clipboard.writeText(emoji.char).then(() => {
      btnCopyInspected.textContent = `✅ Copied "${emoji.char}"!`;
      setTimeout(() => {
        btnCopyInspected.textContent = '📋 Copy Emoji to Clipboard';
      }, 1500);
    });
  }

  function filterEmojis() {
    const query = searchInput.value.toLowerCase().trim();
    let filtered = emojiData;

    if (currentCategory !== 'all') {
      filtered = filtered.filter(e => e.cat === currentCategory);
    }

    if (query) {
      filtered = filtered.filter(e => {
        return e.name.toLowerCase().includes(query) ||
               e.tags.toLowerCase().includes(query) ||
               e.char.includes(query);
      });
    }

    renderGrid(filtered);
  }

  function renderGrid(emojis) {
    emojiGrid.innerHTML = '';
    emojiCountBadge.textContent = `${emojis.length} emojis found`;

    if (emojis.length === 0) {
      emojiGrid.innerHTML = '<div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-tertiary);">No emojis found matching your query.</div>';
      return;
    }

    emojis.forEach(e => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'emoji-btn';
      btn.textContent = e.char;
      btn.title = `${e.name} (Click to copy)`;
      btn.addEventListener('click', () => copyEmoji(e));
      btn.addEventListener('mouseenter', () => inspect(e));
      emojiGrid.appendChild(btn);
    });
  }

  // Listeners
  searchInput.addEventListener('input', filterEmojis);
  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    filterEmojis();
    searchInput.focus();
  });

  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-cat');
      categoryHeading.textContent = pill.textContent.trim();
      filterEmojis();
    });
  });

  btnCopyInspected.addEventListener('click', () => {
    if (activeInspectedEmoji) {
      copyEmoji(activeInspectedEmoji);
    }
  });

  // Initial load
  renderRecents();
  filterEmojis();
  inspect(emojiData[0]);
});