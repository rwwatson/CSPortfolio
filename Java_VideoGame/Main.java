import java.awt.Color;
import java.awt.event.KeyEvent;
import java.util.LinkedList;
import java.util.List;
import java.util.Random;

import sedgewick.StdDraw;
import studio10.BackgroundSong;

public class Main {
	public static void main(String[] args) {
		// default pen radius is .002

		double px = 0.5;  // x location of the demo point
		double py = 0.05;  // y location of the demo point
		double p2x = 0.5; // x location of player 2
		double p2y = 0.95; //y location of player 2
		int points = 0; 
		int points2 = 0;
		double ticker = 0; 
		double ticker2 = 0;
		//double ticker3 = 0;
		int stall = 0;
		int stall2 = 0;
		int seconds = 0;
		boolean hit = false;
		boolean hit2 = false;
		List<Double> pig = new LinkedList<Double>(); // x coordinates of treasures
		List<Double> hog = new LinkedList<Double>(); // y coordinates of treasures
		List<Double> bull = new LinkedList<Double>(); // x coordinates of obstacles
		List<Double> steer = new LinkedList<Double>(); // y coordinates of obstacles
		List<Double> crow = new LinkedList<Double>(); // x coordinates of obstacles2
		List<Double> vulcher = new LinkedList<Double>(); // y coordinates of obstacles 2
		String background = "images/fractile 10.PNG";
		
		Color obstacles = new Color(170, 0, 97);
		Color treasures = new Color(122, 210, 0);

		//BackgroundSong sbsp = new BackgroundSong("SpongeBobSquarePants.wav"); // sets music
		//sbsp.playAlways();


		while (true) {
			StdDraw.clear();
			double bee = Math.random();

			ticker = ticker + 1; // adds new treasure every half a second
			if (ticker == 25) {
				pig.add(Math.random());
				hog.add(-0.1);
				bull.add(-0.1);
				steer.add(Math.random());
				crow.add(1.1);
				vulcher.add(Math.random());
				ticker = 0; 
			}

			if(seconds == stall + 2) {
				hit = false;
			}
			if (seconds == stall2 + 2) {
				hit2 = false;
			}

			ticker2 = ticker2 + 1; // counts how many seconds pass
			if (ticker2 == 60) {
				seconds = seconds + 1;
				ticker2 = 0;
			}

			StdDraw.picture(0.5, 0.5, background); 
			
			/**
			 * controls player icons
			 */
			if(hit == false) {
				if (checkFor(KeyEvent.VK_A)) {
					px = px - 0.006;
				}
				if (checkFor(KeyEvent.VK_D)) {
					px = px + 0.006;
				}
				if(checkFor(KeyEvent.VK_W)) {
					py = py + 0.006;
				}
				if(checkFor(KeyEvent.VK_S)) {
					py = py - 0.006;
				}
			}

			if (hit2 == false) {
				if(checkFor(KeyEvent.VK_J)) {
					p2x = p2x - 0.006;
				}
				if(checkFor(KeyEvent.VK_L)) {
					p2x = p2x + 0.006;
				}
				if (checkFor(KeyEvent.VK_K)) {
					p2y = p2y - 0.006;
				}
				if (checkFor(KeyEvent.VK_I)) {
					p2y = p2y + 0.006;
				}
			}
			
			/**
			 * draws player icons
			 */
			StdDraw.setPenColor(Color.BLACK);
			StdDraw.filledCircle(px, py, .03);
			StdDraw.filledCircle(p2x, p2y, .01);
			StdDraw.setPenColor(Color.WHITE);
			StdDraw.setPenRadius(.004);
			StdDraw.circle(px, py, .03);
			StdDraw.setPenRadius(.002);
			StdDraw.filledCircle(p2x, p2y, .03);
			StdDraw.filledCircle(px, py, .01);
			StdDraw.setPenColor(Color.BLACK);
			StdDraw.filledCircle(p2x, p2y, .01);
			StdDraw.setPenRadius(.004);
			StdDraw.circle(p2x, p2y, .03);
			StdDraw.setPenRadius(.002);

			/**
			 * treasure and obstacles spawner and checker
			 */
			for (int i=0; i<pig.size(); ++i) {
				StdDraw.setPenColor(treasures);
				double jump = hog.get(i) + 0.0025;
				hog.set(i, jump);
				StdDraw.filledCircle(pig.get(i), hog.get(i), 0.015);
				double distance = Math.sqrt(Math.pow(hog.get(i)-py, 2) + Math.pow(pig.get(i)-px, 2));
				double distanceB = Math.sqrt(Math.pow(hog.get(i)-p2y, 2) + Math.pow(pig.get(i)-p2x, 2));
				if (distance <= 0.045) {
					pig.set(i, 1.5);
					hog.set(i, 1.5);
					points = points + 1;
				}
				if (distanceB <= 0.045) {
					pig.set(i, 1.5);
					hog.set(i, 1.5);
					points2 = points2 + 1;
				}
				StdDraw.setPenColor(obstacles);
				double slide = bull.get(i) + 0.005;
				bull.set(i, slide);
				StdDraw.filledCircle(bull.get(i), steer.get(i), 0.015);
				double distance2 = Math.sqrt(Math.pow(bull.get(i)-px, 2) + Math.pow(steer.get(i)-py, 2));
				double distance2B = Math.sqrt(Math.pow(bull.get(i)-p2x, 2) + Math.pow(steer.get(i)-p2y, 2));
				if (distance2 <= 0.045) {
					bull.set(i, 1.5);
					steer.set(i, 1.5);
					points = points - 1;
					hit = true;
					stall = seconds;
				}
				if (distance2B <= 0.045) {
					bull.set(i, 1.5);
					steer.set(i, 1.5);
					points2 = points2 - 1;
					hit2 = true;
					stall2 = seconds;
				}
				double slide2 = crow.get(i) - 0.005;
				crow.set(i, slide2);
				StdDraw.filledCircle(crow.get(i), vulcher.get(i), 0.015);
				double distance3 = Math.sqrt(Math.pow(crow.get(i)-px, 2) + Math.pow(vulcher.get(i)-py, 2));
				double distance3B = Math.sqrt(Math.pow(crow.get(i)-p2x, 2) + Math.pow(vulcher.get(i)-p2y, 2));
				if (distance3 <= 0.045) {
					crow.set(i, 1.5);
					vulcher.set(i, 1.5);
					points = points - 1;
					hit = true;
					stall = seconds;
				}
				if (distance3B <= 0.045) {
					crow.set(i, 1.5);
					vulcher.set(i, 1.5);
					points2 = points2 - 1;
					hit2 = true;
					stall2 = seconds;
				}
			}

			/**
			 * draws border and text on border
			 */
			StdDraw.setPenColor(Color.black);
			StdDraw.filledRectangle(0.5, 1.05, 0.55, 0.05);
			StdDraw.filledRectangle(0.5, -0.05, 0.55, 0.05);
			StdDraw.filledRectangle(-0.05, 0.5, 0.05, 0.55);
			StdDraw.filledRectangle(1.05, 0.5, 0.05, 0.55);
			StdDraw.setPenColor(Color.white);
			StdDraw.text(0.5, 1.025, "Player 1: " + points + "   Seconds: " + seconds + "   Player 2: " + points2);
			StdDraw.text(0.5, -0.025, "Player 1 - WASD    Player 2 - IJKL");

			/**
			 * keeps players within boundaries
			 */
			if (px < 0) {
				px = 0;
			}
			if (px > 1) {
				px = 1;
			}
			if (py < 0) {
				py = 0;
			}
			if (py > 1) {
				py = 1;
			}
			if (p2x < 0) {
				p2x = 0;
			}
			if (p2x > 1) {
				p2x = 1;
			}
			if (p2y < 0) {
				p2y = 0;
			}
			if (p2y > 1) {
				p2y = 1;
			}

			/**
			 * ends game
			 */
			if (points == 25 || points2 == 25) {
				break;
			}
			if(checkFor(KeyEvent.VK_X)) {
				break;
			}
			
			/**
			 * changes color scheme
			 */
			if (checkFor(KeyEvent.VK_Z)) {
				if (bee <= 0.2) {
					background = "images/fractile 3.PNG";
					treasures = new Color(60, 203, 218);
					obstacles = new Color(250, 70, 22);
				}
				if (bee > 0.2 && bee <= 0.4) {
					background = "images/fractile 6.PNG";
					treasures = new Color(254, 219, 0);
					obstacles = new Color(114, 0, 98);
				}
				if (bee > 0.4 && bee <= 0.6) {
					background = "images/fractile 10.PNG";
					obstacles = new Color(170, 0, 97);
					treasures = new Color(122, 210, 0);
				}
				if (bee > 0.6 && bee <= 0.8) {
					background = "images/fractile 9.PNG";
					treasures = new Color(0, 0, 0);
					obstacles = new Color(255, 255, 255);
				}
				if (bee > 0.8) {
					background = "images/fractile 1.PNG";
					treasures = new Color(154, 219, 232);
					obstacles = new Color(255, 177, 187);
				}
			}
			StdDraw.show(10);  // 1/100 of a second
		}
		
		/**
		 * prints final screen
		 */
		StdDraw.setPenColor(Color.black);
		StdDraw.picture(0.5, 0.5, background); 
		StdDraw.filledRectangle(0.5, 1.05, 0.55, 0.05);
		StdDraw.filledRectangle(0.5, -0.05, 0.55, 0.05);
		StdDraw.filledRectangle(-0.05, 0.5, 0.05, 0.55);
		StdDraw.filledRectangle(1.05, 0.5, 0.05, 0.55);
		StdDraw.setPenRadius(1);
		if (points == 25) {
			StdDraw.setPenColor(Color.WHITE);
			StdDraw.filledRectangle(0.5, 0.5, 0.175, 0.075);
			StdDraw.setPenColor(Color.BLACK);
			StdDraw.text(0.5, 0.525, "PLAYER 1 WINS");
			StdDraw.text(0.5, 0.475, "PLAYER 2 IS A VIRG");
		}
		if (points2 == 25) {
			StdDraw.setPenColor(Color.WHITE);
			StdDraw.filledRectangle(0.5, 0.5, 0.175, 0.075);
			StdDraw.setPenColor(Color.BLACK);
			StdDraw.text(0.5, 0.525, "PLAYER 2 WINS");
			StdDraw.text(0.5, 0.475, "PLAYER 1 IS A VIRG");
		}
		StdDraw.show(10);
		
	}

	/**
	 * Check to see if a given key is pressed at the moment.  This method does not
	 *   wait for a key to be pressed, so if nothing is pressed, it returns
	 *   false right away.
	 *   
	 * The event constants are found at:
	 *   https://docs.oracle.com/javase/7/docs/api/java/awt/event/KeyEvent.html
	 * @param key the integer code of the key
	 * @return true if that key is down, false otherwise
	 */
	private static boolean checkFor(int key) {
		if (StdDraw.isKeyPressed(key)) {
			return true;
		}
		else {
			return false;
		}
	}

}
