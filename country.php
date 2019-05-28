<?php

class Country {
    private $countries = array();
    private $result_limit = 50;

    public function getCountry($term) {
        
        if (empty($term)) {
            return json_encode(array('error'=>'Please enter a valid search term.'));
        }

        $response = $this->curl_connect('name',$term);
        $response = json_decode($response, true);

        if (empty($response['error']) && empty($response['status'])) {
            if (!empty($response['name'])) {
                $response = array($response);
            }
            $this->countries = $response;

        }

        $response = $this->curl_connect('alpha',$term);
        $response = json_decode($response, true);

        if (empty($response['error']) && empty($response['status'])) {
            if (!empty($response['name'])) {
                $response = array($response);
            }
            $this->countries = array_merge($this->countries, $response);
        }

        $this->dedupe();

        $this->sortCountries();

        $stats = $this->getStats();

        $this->limitResults();

        if (empty($this->countries)) {
            return json_encode(array('error'=>'No results were found for the term ' . $term . '.'));
        }

        return json_encode(array('results'=>$this->countries, 'stats'=>$stats));

    }

    private function sortCountries() {
        
        usort($this->countries, function($a, $b) {
            $returnval = $a['name'] <=> $b['name'];
            if ($returnval == 0) {
                $returnval = $a['population'] <=> $b['population'];
            }
            return $returnval;
        });

    }

    private function dedupe() {

        foreach (array_reverse($this->countries) as $k=>$v) {
            foreach ($this->countries as $k2=>$v2) {
                if ($k2 < $k) {
                    if (serialize($this->countries[$k]) === serialize($this->countries[$k2])) {
                        unset($this->countries[$k]);
                    } 
                }
            }
        }

    }

    private function getStats() {

        // total # countries
        // list all regions and subregions and how many times they occurred

        $stats = array();

        $stats['count'] = count($this->countries);

        $regions = array();

        $subregions = array();

        foreach ($this->countries as $k=>$v) {
            if (!empty($regions[$v['region']])) {
                $regions[$v['region']] = $regions[$v['region']] + 1;
            } else {
                $regions[$v['region']] = 1;
            }

            if (!empty($subregions[$v['subregion']])) {
                $subregions[$v['subregion']] = $subregions[$v['subregion']] + 1;
            } else {
                $subregions[$v['subregion']] = 1;
            }
        }

        ksort($regions);
        ksort($subregions);

        $stats['regions'] = $regions;
        $stats['subregions'] = $subregions;

        return $stats;

    }

    private function limitResults() {
        $this->countries = array_slice($this->countries, 0, $this->result_limit, true);
    }

    private function curl_connect($type = 'name', $term = '') {

        $url  = 'https://restcountries.eu/rest/v2/' . $type . '/' . $term . '?fields=name;alpha2Code;alpha3Code;flag;region;subregion;population;languages;';

        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL             => $url,
            CURLOPT_RETURNTRANSFER  => true,
            CURLOPT_ENCODING        => '',
            CURLOPT_MAXREDIRS       => 10,
            CURLOPT_CONNECTTIMEOUT  => 60,
            CURLOPT_TIMEOUT         => 60,
            CURLOPT_HTTP_VERSION    => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST   => 'GET',
            CURLOPT_HTTPHEADER      => array("cache-control: no-cache","content-type: application/json")
        ));

        $response = curl_exec($curl);

        $curl_error = curl_error($curl);

        if ($curl_error) {
            $response = array('error'=>$curl_error);
        }

        if ($response) {
            return $response;
        }

    }
}

$country = new Country();

$term = $_REQUEST['term'];

$result = $country->getCountry($term);

print $result;

?>