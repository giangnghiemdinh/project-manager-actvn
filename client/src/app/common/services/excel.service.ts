import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';

type TABLE = any[][];
export interface ExcelColumn {
    title: string,
    width?: number,
    numFmt?: string,
    alignment?: 'left' | 'center' | 'right',
}

export interface ExcelNote {
    cell: string,
    text: string;
}

@Injectable({
    providedIn: 'root'
})
export class ExcelService {
    fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    fileExtension = '.xlsx';

    export(options: {
        columns: ExcelColumn[],
        sheetName: string,
        fileName: string,
        notes?: ExcelNote[],
        data?: any[]
    }) {
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet(options.sheetName, {properties: {tabColor: {argb: 'FFC0000'}}});
        const headers = options.columns.map(c => c.title);
        const headerRow = worksheet.addRow(headers);
        headerRow.eachCell((cell) => {
            cell.font = {
                name: 'Arial',
                family: 2,
                bold: true,
                size: 12,
            };
            cell.alignment = {
                vertical: 'middle', horizontal: 'center'
            };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: {argb: 'CCCCCC'},
            };
            cell.border = {top: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}};
        });
        worksheet.columns = [];
        for (let i = 0; i < options.columns.length; i++) {
            const column = options.columns[i];
            worksheet.getColumn(i + 1).width = column.width || 25;
            column.numFmt && (worksheet.getColumn(i + 1).numFmt = column.numFmt);
        }

        for (const row of (options.data || [])) {
            const currentRow = worksheet.addRow(Object.values(row));
            currentRow.eachCell((cell, cellIndex) => {
                cell.alignment = { horizontal: options.columns[cellIndex - 1].alignment || 'left'};
            });
        }

        worksheet.eachRow({includeEmpty: true}, (row, rowNumber) => {
            row.font = {
                name: 'Arial',
                family: 2,
                bold: rowNumber === 1,
                size: 10,
            };
        });

        if (options.notes?.length) {
            for (let note of options.notes) {
                worksheet.getCell(note.cell).note = {
                    texts: [
                        {'font': {'name': 'Arial', 'family': 2, 'italic': true, 'size': 10}, 'text': note.text},
                    ],
                    margins: {
                        insetmode: 'custom',
                        inset: [0.25, 0.25, 0.35, 0.35]
                    },
                    protection: {
                        locked: 'True',
                        lockText: 'False'
                    },
                    editAs: 'twoCells',
                }
            }
        }

        // Generate & Save Excel File
        workbook.xlsx.writeBuffer().then((dataRow) => {
            const blob = new Blob([dataRow], {type: this.fileType});
            FileSaver.saveAs(blob, options.fileName + '_' + new Date().getTime() + this.fileExtension);
        });
    }

    import(file: any, callBackFn: any) {

        const listOfData: any[] = [];

        const reader: FileReader = new FileReader();

        reader.onload = (e: any) => {
            // read and convert excel data to binary type
            const bstr: string = e.target.result;
            const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'buffer'});

            // Read all sheet
            const sheetNames = wb.SheetNames;

            // forEach in number of sheets
            sheetNames.forEach(sheetName => {
                const ws: XLSX.WorkSheet = wb.Sheets[sheetName];
                const convertedData: any = (XLSX.utils.sheet_to_json(ws, {header: 1, blankrows: false})) as TABLE;
                listOfData.push(convertedData);
            });
            if (listOfData.length > 0) {
                callBackFn(null, listOfData);
            }
        };

        reader.onerror = (err: any) => callBackFn(err, null);

        reader.readAsArrayBuffer(file);
    }
}
