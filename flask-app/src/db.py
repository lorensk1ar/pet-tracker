import sqlite3

# Connect to database
connection = sqlite3.connect("pets.db")

# Establish cursor
cursor = connection.cursor()

# Create table
cursor.execute("CREATE TABLE IF NOT EXISTS pets (id INTEGER PRIMARY KEY, name TEXT, picture TEXT, species TEXT, friendly BOOL)")

# Insert data
cursor.execute("INSERT INTO pets (name, picture, species, friendly) VALUES ('Fluffy', 'fluffy.png', 'Dog', True)")
cursor.execute("INSERT INTO pets (name, picture, species, friendly) VALUES ('Whiskers', 'whiskers.jpg', 'Cat', False)")
cursor.execute("INSERT INTO pets (name, picture, species, friendly) VALUES ('Bubbles', 'bubbles.svg', 'Fish', True)")

# Commit and close
connection.commit()
connection.close()

