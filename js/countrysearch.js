$country = {
	input: null,
	btnsubmit: null,
    term: null,
    resultDiv: null,
    stats: null,
    statDiv: null,
	init: function() {
        $country.input = jQuery('#term');
        $country.input.focus();
        $country.btnsubmit = jQuery('#btnsubmit');
        $country.resultDiv = jQuery('#results');
        $country.statDiv = jQuery('#stats');
	},
	submit: function() {
        $country.term = $country.input.val();
        $country.resetDisplay();
        $country.resultDiv.show();
        $country.getCountry($country.term);
	},
    getCountry: function(term) {
        var jqxhr = $.ajax( "country-demo/country.php?term=" + term )
        .done(function(data) {
            data = JSON.parse(data);

            if (data.stats) {
                $country.stats = data.stats;
            }
            if (data.results) {
                data = data.results;
            }

            if (!data.error) {
                $country.buildResults(data);
                $country.buildStats($country.stats);
            } else {
                $country.buildError(data);
            }

            $country.input.focus();
        })
        .fail(function(data) {
            // error
        })
        .always(function() {
            // always
        });
    },
    buildResults: function(data) {
        var result = jQuery('<div>').addClass('resultRow');

        var header = $country.buildHeader($country.term);

        var table = "";

        table += '<table>';
        table += header;

        for (var x=0; x<data.length; x++) {
            table += $country.buildResultRow(data[x]);
        }
        table += '</table>';

        result.append(table);

        $country.resultDiv.show();

        $country.resultDiv.html(result);

    },
    buildHeader: function(term) {
        var html = '';

        html += '<tr><td class="term" colspan="8"><h3>SEARCH FOR: ' + term + '</h3></td></tr>';
        html += '<tr>';
        html += '<td class="head flag">FLAG</td>';
        html += '<td class="head name">NAME</td>';
        html += '<td class="head alpha2code">CODE2</td>';
        html += '<td class="head alpha3code">CODE3</td>';
        html += '<td class="head region">REGION</td>';
        html += '<td class="head subregion">SUBREGION</td>';
        html += '<td class="head population">POPULATION</td>';
        html += '<td class="head languages">LANGUAGES</td>';
        html += '</tr>';

        return html;
    },
    buildResultRow: function(country) {
        var html = '';

        html += '<tr>';
        html += '<td class="flag"><img src="' + country.flag + '" style="height: 30px; width: auto"/></td>';
        html += '<td class="name">' + country.name + '</td>';
        html += '<td class="alpha2code">' + country.alpha2Code + '</td>';
        html += '<td class="alpha3code">' + country.alpha3Code + '</td>';
        html += '<td class="region">' + country.region + '</td>';
        html += '<td class="subregion">' + country.subregion + '</td>';
        html += '<td class="population">' + country.population + '</td>';
        html += '<td class="languages">' + $country.getLanguages(country) + '</td>';
        html += '</tr>';

        return html;
    },
    getLanguages: function(country) {
        var lang = country.languages,
            html = "";

        for (var x=0; x<lang.length; x++) {
            html += lang[x].name + '<br/>';
        }

        return html;
    },
    buildStats: function(stats) {
        var html = '';

        html += '<h3>TOTAL NUMBER OF COUNTRIES: ' + stats.count + '</h3>';

        html += '<h3>REGIONS</h3>';
        html += '<ul>';

        for (var x in stats.regions) {
            html += '<li>' + x + ' -- ' + stats.regions[x] + '</li>';
        }
        html += '</ul>';

        html += '<h3>SUBREGIONS</h3>';
        html += '<ul>';

        for (var x in stats.subregions) {
            html += '<li>' + x + ' -- ' + stats.subregions[x] + '</li>';
        }
        html += '</ul>';

        jQuery('#stats').show();

        jQuery('#stats').html(html);

    },
    buildError: function(data) {

        var html = '<div class="error">' + data.error + '</div>';

        $country.resultDiv.show();

        $country.resultDiv.html(html);

    },
    resetDisplay: function() {
        $country.input.val('');
        $country.resultDiv.hide();
        $country.resultDiv.html('Loading...');
        $country.statDiv.hide();
        $country.statDiv.html('');
    }
};

jQuery(document).ready(function() {
    $country.init();

    $country.btnsubmit.on('click', function(e) {
        e.preventDefault();
        $country.submit();
    });

    $country.input.on('keypress', function(e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            $country.submit();
        }
    });
});