import DataEditor, {
  // DataEditorProps,
  GridCellKind,
  // GridColumn,
  GridColumnIcon
} from "@glideapps/glide-data-grid";
import { useExtraCells } from "@glideapps/glide-data-grid-cells";
import "@glideapps/glide-data-grid/dist/index.css";
import { useCallback, useState } from "react";
import { Data } from "./data";
import { useLayer } from "react-laag";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const App = () => {
  const [showSearch, setShowSearch] = useState(false);
  const onSearchClose = useCallback(() => setShowSearch(false), []);
  let [data, setData] = useState(Data);
  let [isSubMenuOpen, setIsSubMenuOpen] = useState(true);
  const cellProps = useExtraCells();
  const [showMenu, setShowMenu] = useState();

  const [columns, setColumns] = useState([
    {
      title: "Name",
      id: "name",
      hasMenu: true,
      icon: GridColumnIcon.HeaderString
    },
    {
      title: "Company",
      id: "company",
      hasMenu: true,
      dataType: "Bubble"
    },
    {
      title: "Age",
      id: "age",
      hasMenu: true,
      dataType: "Number"
    },
    {
      title: "Image dd",
      id: "image",
      key: "image",
      dataType: "Image"
    },
    {
      title: "Email",
      id: "email",
      hasMenu: true
    },
    {
      title: "Date",
      id: "date",
      hasMenu: true,
      dataType: "DatePicker"
    },
    {
      title: "Phone",
      id: "phone"
    },
    {
      title: "Address",
      id: "address"
    },
    {
      title: "about",
      id: "about"
    }
  ]);

  const onColumnResize = useCallback((column, newSize) => {
    setColumns((prevColsMap) => {
      const index = columns.findIndex((ci) => ci.title === column.title);
      const newArray = [...prevColsMap];
      newArray.splice(index, 1, {
        ...prevColsMap[index],
        width: newSize
      });
      return newArray;
    });
  },[columns]);

  const getContent = useCallback(
    (cell) => {
      const [col, row] = cell;
      const dataRow = data[row];
      const d = dataRow[columns[col].id];

      const { dataType } = columns[col];

      if (dataType === "Number") {
        return {
          allowOverlay: true,
          kind: GridCellKind.Number,
          data: d,
          displayData: d.toString()
        };
      } else if (dataType === "Image") {
        return {
          kind: GridCellKind.Image,
          data: [d],
          allowOverlay: true,
          allowAdd: true
        };
      } else if (dataType === "Bubble") {
        return {
          kind: GridCellKind.Bubble,
          data: ["sss", "ss"],
          allowOverlay: true
        };
      } else if (dataType === "SingleDropdown") {
        return {
          kind: GridCellKind.Custom,
          allowOverlay: true,
          copyData: 4,
          data: {
            kind: "dropdown-cell",
            allowedValues: ["Good", "Better", "Best"],
            value: "Good"
          }
        };
      } else if (dataType === "DatePicker") {
        return {
          kind: GridCellKind.Custom,
          allowOverlay: true,
          copyData: "4",
          data: {
            kind: "date-picker-cell",
            date: new Date(),
            displayDate: new Date().toISOString(),
            format: "date"
          }
        };
      } else {
        return {
          kind: GridCellKind.Text,
          allowOverlay: true,
          readonly: false,
          displayData: d,
          data: d
        };
      }
    },
    [data, columns]
  );

  const onCellEdited = useCallback(
    (cell, newValue) => {
      if (newValue.kind !== GridCellKind.Text) {
        // we only have text cells, might as well just die here.
        return;
      }

      const [col, row] = cell;
      const key = columns[col].id;
      data[row][key] = newValue.data;

      setData(data);
    },
    [data, columns]
  );

  const onDragOverCell = (cell) => {
    console.log(cell);
  };

  const onRowAppended = useCallback(() => {
    let newRowObj = {};
    for (const [key, value] of Object.entries(data[0])) {
      newRowObj[key] = "";
    }
    setData([...data, newRowObj]);
  }, [data]);

  const onHeaderClicked = useCallback(() => {
    console.log("Header clicked");
  }, []);

  const onOutsideClick = () => {
    if (isSubMenuOpen) {
      setShowMenu(undefined);
      setIsSubMenuOpen((cv) => !cv);
    }
    setIsSubMenuOpen((cv) => !cv);
  };

  const { renderLayer, layerProps } = useLayer({
    isOpen: showMenu !== undefined,
    triggerOffset: 2,
    onOutsideClick,
    trigger: {
      getBounds: () => ({
        bottom: (showMenu?.bounds.y ?? 0) + (showMenu?.bounds.height ?? 0),
        height: showMenu?.bounds.height ?? 0,
        left: showMenu?.bounds.x ?? 0,
        right: (showMenu?.bounds.x ?? 0) + (showMenu?.bounds.width ?? 0),
        top: showMenu?.bounds.y ?? 0,
        width: showMenu?.bounds.width ?? 0
      })
    },
    placement: "bottom-end",
    auto: true
  });

  const onHeaderMenuClick = useCallback((col, bounds) => {
    setIsSubMenuOpen((cv) => !cv);
    setShowMenu({ col, bounds });
  }, []);

  const onAddCol = useCallback(() => {
    const newData = data.map((row) => {
      return { ...row, new: "" };
    });
    setData(newData);
    // setIndexes([...Object.keys(data[0]), "new"]);
    setColumns([
      ...columns,
      {
        title: "New",
        id: "new",
        hasMenu: true
      }
    ]);
  }, [data, columns]);

  const onColMoved = useCallback((startIndex, endIndex) => {
    setColumns((old) => {
      const newCols = [...old];
      const [toMove] = newCols.splice(startIndex, 1);
      newCols.splice(endIndex, 0, toMove);
      return newCols;
    });
  }, []);

  return (
    <div className="App">
      {/* <button onClick={() => setShowSearch(true)}>
                  Show Search
            </button> */}
      <DataEditor
        {...cellProps}
        getCellContent={getContent}
        columns={columns}
        onCellEdited={onCellEdited}
        onHeaderMenuClick={onHeaderMenuClick}
        onHeaderClicked={onHeaderClicked}
        onCellContextMenu={(_, e) => e.preventDefault()}
        rows={data.length}
        rowMarkers={"both"}
        showSearch={showSearch}
        getCellsForSelection={true}
        onSearchClose={onSearchClose}
        onRowAppended={onRowAppended}
        onDragOverCell={onDragOverCell}
        onRowMoved={(s, e) => window.alert(`Moved row ${s} to ${e}`)}
        height={"500px"}
        onColumnMoved={onColMoved}
        trailingRowOptions={{
          // How to get the trailing row to look right
          sticky: true,
          tint: false,
          hint: "New row...",
          themeOverride: true
        }}
        smoothScrollX={true}
        smoothScrollY={true}
        verticalBorder={(c) => c > 0}
        // freezeColumns={1}
        onDragStart={(e) => {
          e.setData("text/plain", "Drag data here!");
        }}
        rightElement={
          <div className="addCol">
            <button onClick={() => onAddCol()}>+</button>
          </div>
        }
        rightElementProps={{
          fill: false,
          sticky: true
        }}
        onColumnResize={onColumnResize}
      />
      <div id="portal" />
      {showMenu !== undefined &&
        renderLayer(
          <div
            {...layerProps}
            style={{
              ...layerProps.style,
              width: 300,
              padding: 4,
              borderRadius: 8,
              backgroundColor: "white",
              border: "1px solid black"
            }}
          >
            <ul>
              <li>Action 1</li>
              <li>Action 2</li>
              <li>Action 3</li>
            </ul>
          </div>
        )}
    </div>
  );
};

export default App;
