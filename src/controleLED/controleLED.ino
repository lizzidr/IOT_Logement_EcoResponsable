#include <ESP8266WiFi.h>        // Pour ESP8266
#include <ESP8266HTTPClient.h>   // Pour gérer les requêtes HTTP
#include <DHT.h>                // Bibliothèque pour le capteur DHT

// Configuration du Wi-Fi (iPhone point d'accès)
const char* ssid = "Azul fellak";  // SSID 
const char* password = "breflluzagh";  // Mot de passe du point d'accès
WiFiClient client;  // Déclare un objet WiFiClient

// Configuration du capteur DHT
#define DHTPIN D5  // GPIO14 est la broche D5 sur NodeMCU
#define DHTTYPE DHT22   // DHT11
DHT dht(DHTPIN, DHTTYPE);  // Initialisation du capteur

// Configuration de la LED
#define LEDPIN D4 // Pin de la LED

void setup() {
  Serial.begin(115200);   // Initialisation de la communication série
  dht.begin();            // Initialisation du capteur DHT
  WiFi.begin(ssid, password);  // Connexion au réseau Wi-Fi
  // Init LED
  pinMode(LEDPIN, OUTPUT);
  digitalWrite(LEDPIN, HIGH);
  
  // Boucle d'attente pour la connexion Wi-Fi
  Serial.print("Connexion au Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Connecté au WiFi");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("Erreur de connexion WiFi");
  }
}

void controlLED() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String serverPath = "http://192.168.93.217:5000/action/LED";  

    http.begin(client, serverPath); 
    http.setTimeout(5000); // 5 secondes

    int httpResponseCode = http.GET();

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(response);

      // Allumer ou éteindre la LED en fonction de la réponse
      if (response.indexOf("\"action\":\"on\"") != -1) {
        digitalWrite(LEDPIN, LOW);  // Allumer la LED
      } else {
        digitalWrite(LEDPIN, HIGH);   // Éteindre la LED
      }
    } else {
      Serial.print("LED : Erreur dans l'envoi : ");
      Serial.println(httpResponseCode);
    }

    http.end();
  }
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String serverPath = "http://192.168.93.217:5000/capteur/1/mesures";  

    // Lire la température du capteur DHT
    float temperature = dht.readTemperature();
    if (isnan(temperature)) {
      Serial.println("Erreur de lecture du capteur !");
      delay(5000);
      return;
    }
    Serial.println("Temperature = " + String(temperature) + " °C.");

    // Envoyer la température au serveur Flask
    http.begin(client, serverPath);
    http.setTimeout(5000); // 5 secondes

    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{\"valeur\": " + String(temperature) + "}";
    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.println("Donnée envoyée avec succès !");
      String response = http.getString();
      Serial.println(response);
    } else {
      Serial.print("Erreur dans l'envoi : ");
      Serial.println(httpResponseCode);
    }

    http.end();
  }
  controlLED();
  delay(10000); // Envoyer les données toutes les minutes
}