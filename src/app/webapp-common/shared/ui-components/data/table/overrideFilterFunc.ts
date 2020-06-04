export function custumFilterFunc() {
  // this._first = 0;
  if (this.lazy) {
    this.onLazyLoad.emit(this.createLazyLoadMetadata());
  }
  else {
    if (!this.value || !this.columns) {
      return;
    }
    this.filteredValue = [];
    for (let i = 0; i < this.value.length; i++) {
      let localMatch = true;
      let globalMatch = false;
      for (let j = 0; j < this.columns.length; j++) {
        const col = this.columns[j], filterMeta = this.filters[col.filterField || col.field];
        // local
        if (filterMeta) {
          const filterValue = filterMeta.value, filterField = col.filterField || col.field,
            filterMatchMode = filterMeta.matchMode || 'startsWith',
            dataFieldValue = this.resolveFieldData(this.value[i], filterField);
          const filterConstraint = this.filterConstraints[filterMatchMode];
          if (!filterConstraint(dataFieldValue, filterValue)) {
            localMatch = false;
          }
          if (!localMatch) {
            break;
          }
        }
        // global
        if (!col.excludeGlobalFilter && this.globalFilter && !globalMatch) {
          globalMatch = this.filterConstraints['contains'](this.resolveFieldData(this.value[i], col.filterField || col.field), this.globalFilter.value);
        }
      }
      let matches = localMatch;
      if (this.globalFilter) {
        matches = localMatch && globalMatch;
      }
      if (matches) {
        this.filteredValue.push(this.value[i]);
      }
    }
    if (this.filteredValue.length === this.value.length) {
      this.filteredValue = null;
    }
    if (this.paginator) {
      this.totalRecords = this.filteredValue ? this.filteredValue.length : this.value ? this.value.length : 0;
    }
    this.updateDataToRender(this.filteredValue || this.value);
  }
  this.onFilter.emit({
    filters      : this.filters,
    filteredValue: this.filteredValue || this.value
  });
}

export function custumSortSingle() {
  if (this.value) {
    if (this.sortColumn && this.sortColumn.sortable === 'custom') {
      this.preventSortPropagation = true;
      this.sortColumn.sortFunction.emit({
        field: this.sortField,
        order: this.sortOrder
      });
    }
    else {
      this.value.sort((data1, data2) => {
        const value1 = this.resolveFieldData(data1, this.sortField);
        const value2 = this.resolveFieldData(data2, this.sortField);
        let result = null;
        if (value1 == null && value2 != null) {
          result = -1;
        } else if (value1 != null && value2 == null) {
          result = 1;
        } else if (value1 == null && value2 == null) {
          result = 0;
        } else if (typeof value1 === 'string' && typeof value2 === 'string') {
          result = value1.localeCompare(value2);
        } else {
          result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
        }
        return (this.sortOrder * result);
      });
    }
    // this._first = 0;
    if (this.hasFilter()) {
      this._filter();
    }
  }
}
