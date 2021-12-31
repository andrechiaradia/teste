<?php
class SpeechaceAPI
{
   private $base    = 'https://api.speechace.co/api/scoring/text/v0.5/json';
   private $apikey  = "";
   private $userId  = "BXTS-EP-00001";
   private $dialect = "en-us";
   private $text;
   private $file;

   public function __construct($text, $file)
   {
      $this->text = $text;
      $this->file = $file;
   }

   public function getResult()
   {
      $ch = curl_init("{$this->base}?key={$this->apikey}&user_id={$this->userId}&dialect={$this->dialect}");

      curl_setopt_array($ch, $this->curlOptions());
      $raw = curl_exec($ch);

      if (curl_errno($ch) > 0)
         return json_encode(array("message" => "[ERROR] Speechace API: " . curl_error($ch)));

      curl_close($ch);
      return $raw;
   }

   protected function curlOptions()
   {
      return array(
         CURLOPT_POST           => true,
         CURLOPT_ENCODING       => '',
         CURLOPT_DNS_CACHE_TIMEOUT => 600,
         CURLOPT_TCP_FASTOPEN   => true,
         CURLOPT_IPRESOLVE      => CURL_IPRESOLVE_V4,
         CURLOPT_RETURNTRANSFER => true,
         CURLOPT_FOLLOWLOCATION => true,
         CURLOPT_CONNECTTIMEOUT => 7,
         CURLOPT_HTTPHEADER     => array("Content-Type:multipart/form-data"),
         CURLOPT_POSTFIELDS     => array(
            "user_audio_file" => curl_file_create($this->file),
            "user_id"         => $this->userId,
            "text"            => $this->text,
         ),
      );
   }
}

if (isset($_POST['text']) && isset($_FILES['user_audio_file']))
{
   // $speechace = new SpeechaceAPI($_POST['text'], $_FILES['user_audio_file']['tmp_name']);
   // $response = $speechace->getResult();
   echo json_encode([
      'status' => 'success',
      'text_score' => [
         'quality_score' => rand(65, 80),
         'text' => explode("\n", $_POST['text'])[0],
      ]
   ]);
   // echo json_encode($response);

   //$eta = microtime(true) - $_SERVER["REQUEST_TIME_FLOAT"];
   //file_put_contents('log', $eta . "\n", FILE_APPEND);

   die;
}
