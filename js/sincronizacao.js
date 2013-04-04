var _total_produtos = 0;
var tcount = new TimeCounter();
$(document).on('pageinit', function() {
    sincronizar_produtos_total();
});

function sincronizar_produtos_total() {
    tcount.start();
    block(false);
    $.ajax({
        url: _situacoes.urls.produtos_total,
        dataType: 'html',
        type: 'GET',
        beforeSend: function() {
            $('#tr_produtos td:eq(2)').html('<b class="ui-table-cell-label">Total registro</b> 0');
        },
        success: function(xhr) {
            $('#tr_produtos td:eq(2)').html('<b class="ui-table-cell-label">Total registro</b> ' + xhr);
            $('#tr_produtos td:eq(0)').html('<b class="ui-table-cell-label">Atualização</b> ' + date('d/m/Y H:i:s'));
            _total_produtos = xhr;
            sincronizar_produtos_lista();
        },
        error: function() {
            $('#tr_produtos td:eq(3)').html('<b class="ui-table-cell-label">Situação</b> <span class="situacoes_sincronizacao_2">Error</span>');
            block(true);
            jAviso('Tempo decorrido para a atualização ' + tcount.stop() + ' Segundos.');
        }
    });
}

function sincronizar_produtos_lista() {
    $.ajax({
        url: _situacoes.urls.produtos_lista,
        dataType: 'json',
        type: 'GET',
        beforeSend: function() {
            $('#tr_produtos td:eq(1)').html('<b class="ui-table-cell-label">Total sincronizado</b> 0');
            $('#tr_produtos td:eq(3)').html('<b class="ui-table-cell-label">Situação</b> <span class="situacoes_sincronizacao_4">Sincronizando</span>');
        },
        success: function(result) {
            var i = 0;

            var query = 'DELETE FROM produtos;';
            debug('QUERY', query);
            db.transaction(function(tx) {
                tx.executeSql(query, [],
                        function(tx, result) {
                            $('#tr_produtos td:eq(1)').html('<b class="ui-table-cell-label">Total sincronizado</b> ' + i);
                            debug('SUCCESS', 'Insert OK');
                        },
                        function(tx, result) {
                            debug('ERROR', result.message);
                        });
            });

            $.each(result, function(a, b) {
                var query = 'INSERT INTO produtos (id_produtos, cod_produto, dsc_produto, desconto_maximo, data_hora_atualizacao, estoque, valor, id_empresas) VALUES ("' + b.id_produtos + '","' + b.cod_produto + '","' + b.dsc_produto + '","' + b.desconto_maximo + '","' + date('Y-M-d') + '","' + b.estoque + '",' + b.valor + ',"' + b.id_empresas + '");';
                debug('QUERY', query);
                db.transaction(function(tx) {
                    tx.executeSql(query, [],
                            function(tx, result) {
                                i++;
                                $('#tr_produtos td:eq(1)').html('<b class="ui-table-cell-label">Total sincronizado</b> ' + i);
                                if (i == _total_produtos) {
                                    $('#tr_produtos td:eq(3)').html('<b class="ui-table-cell-label">Situação</b> <span class="situacoes_sincronizacao_1">Sincronizado</span>');
                                    block(true);
                                    jAviso('Tempo decorrido para a atualização ' + tcount.stop() + ' Segundos.');
                                }
                            },
                            function(tx, result) {
                                $('#tr_produtos td:eq(3)').html('<b class="ui-table-cell-label">Situação</b> <span class="situacoes_sincronizacao_2">Error</span>');
                                debug('ERROR', result.message);
                                block(true);
                                jAviso('Tempo decorrido para a atualização ' + tcount.stop() + ' Segundos.');
                            });
                });
            });
        },
        error: function() {
            $('#tr_produtos td:eq(3)').html('<b class="ui-table-cell-label">Situação</b> <span class="situacoes_sincronizacao_2">Error</span>');
            block(true);
            jAviso('Tempo decorrido para a atualização ' + tcount.stop() + ' Segundos.');
        }
    });
}