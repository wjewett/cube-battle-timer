# Cube Battle Timer

This is a node/socket.io application for Raspberry Pi for use as a competitive timer. Setup used as explained in the comments was for 5 buttons, one master start timer button and four player stop timer buttons. This was originally used for a small Rubik's cube solving competition where the judge started the timer using the master button and each individual competitor solved his/her cube and then hit his/her individual stop time button when finished. The application has two different front end display options. One is the timer with a control panel as a sidebar for setting number of players, changing their names, and assessing 2 second penalties for various violations. The second display, called scoreboard, removes the sidebar and simply displays the timers.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

For it to run in it's current state, you need a Raspberry Pi with Node.js installed on it.
NOTE: This application has only been tested on a Raspberry Pi running Rasperian.

### Installing

1. Download this repo onto a Raspberry Pi running Rasperian that has Node.js installed.
NOTE: It make work on other Rasperry Pi operating systems, but it has only been tested and use on Rasperian.

1b. Make sure the Raspberry Pi is connected to a network with another computer, unless your Pi has a browser, you can use that. Get your Pi's MAC address if accessing from another computer.

2. Open console and navigate to the directory containing the battle timer files.

3. In the console enter "npm install" and allow Node to install the necessary packages.

4. Once finished enter "npm run serve" or "npm index.js" and it should start the server.

5. The Battle Timer will load on port 3000.
    - If you are on a browser on the Pi itself type 'localhost:3000' in the address bar.
    - If you are on a computer on the same netowrk type '[MAC address of PI]:3000' in the address bar.

6. You should now be on the control page with a sidebar.

7. If you have another screen on which you only want the timers without the sidebar then navigate to '[MAC of Pi]:3000/scoreboard.html'

### Setup

1. We used 5 buttons connected to the Pi. One button was the master timer start button. The other 4 were for competitors to stop time once they had finished their Rubik's cube solve. 

2. The comments in the index.js file give an indication of how the buttons we used were plugged into the Raspberry Pi. We used buttons that had 2 wires for button operation, we did not use lights on the buttons.

### Simulation Versions

The two other branches, names 'onesided' and 'twosided' are simulations that do not connect to buttons or a raspbery pi.

The 'onesided' branch is exactly the same GUI as the master branch, and the 'twosided' has an alternative method of displaying the results that is more automated.

Both branches should run fine on any computer with node installed. 

The app.js files in those two branches have variable called 'maxLength'. Search for that to change the maximum length of the simulation in seconds (currently set to 5).

The 'twosided' branch was created first and then the 'onesided' and then the master, so the master and onesided branches may have some extraneous code in the app.js file and the style.css files from the original 'twosided' branch.

## Deployment

You could easily deploy the two non-master branches on a node server as is. Any deployment of the master branch is up to you.

## Built With

Node.js and uses node packages: Express, Socket.io, Onoff, and Timer-node

## Authors

* Tony Jewett - (https://github.com/trunklebob) - Developed the back end

* William Jewett - (https://github.com/wjewett) - Developed the front end

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* PurpleBooth - thanks for the README template.

