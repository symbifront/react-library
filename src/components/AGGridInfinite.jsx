import React from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';

// styles
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

function onGridReady(params) {
    fetch('https://www.ag-grid.com/example-assets/call-data.json')
      .then((resp) => resp.json())
      .then((data) => {
          const dataSource = {
              rowCount: null,
              getRows: function (params) {
                  setTimeout( function() {
                      const rowsThisPage = data.slice(params.startRow, params.endRow);
                      const lastRow = -1;
                      params.successCallback(rowsThisPage, lastRow);
                  }, 500);
              }
          };
          params.api.setDatasource(dataSource);
      });
};

const columnsDefault = [
    {headerName: "ID", width: 100,
        valueGetter: 'node.id',
        cellRenderer: 'loadingRenderer'
    }
];

const gridOptionsDefault = {
    defaultColDef: {
        resizable: true
    },
    debug: true,
    rowBuffer: 0,
    rowSelection: 'multiple',
    rowDeselection: true,
    rowModelType: 'infinite',
    paginationPageSize: 100,
    cacheOverflowSize: 2,
    maxConcurrentDatasourceRequests: 1,
    infiniteInitialRowCount: 1000,
    maxBlocksInCache: 10,
    onCellEditingStarted: (evt) => {
        // when editing starts we refresh the grid so the user has the
        // most recent data
        evt.api.refreshInfiniteCache();
    }
};

const AGGridInfinite = ({ columns, gridOptions, onGridReady }) => {
    gridOptions.onGridReady = onGridReady;
    gridOptions.columnDefs = columns;
    return (
      <AgGridReact { ...gridOptions} />
    );
};

AGGridInfinite.propTypes = {
    columns: PropTypes.array,
    gridOptions: PropTypes.object,
    onGridReady: PropTypes.func,
};

AGGridInfinite.defaultProps = {
    columns: columnsDefault,
    gridOptions: gridOptionsDefault,
    onGridReady: onGridReady
};

export default AGGridInfinite;
