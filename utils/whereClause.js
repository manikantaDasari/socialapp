class WhereClause {
  constructor(base, bigQ) {
    this.base = base;
    this.bigQ = bigQ;
  }

  search() {
    const searchQuery = this.bigQ.search
      ? {
          name: new RegExp(this.bigQ.search, "i"),
        }
      : {};

    this.base = this.base.find({ ...searchQuery });
    return this;
  }

  pager(itemsPerPage) {
    let currentPage = 1;
    if (this.bigQ.page) {
      currentPage = this.bigQ.page;
    }
    const skipVal = itemsPerPage * (currentPage - 1);
    this.base = this.base.limit(itemsPerPage).skip(skipVal);
    return this;
  }

  filter() {
    const copyQ = { ...this.bigQ };

    delete copyQ["search"];
    delete copyQ["page"];
    delete copyQ["limit"];

    const stringOfCOpyQ = JSON.stringify(copyQ).replace(
      /\b(gte|lte)\b/i,
      (m) => `$${m}`
    );
    const jsonOfCopyQ = JSON.parse(stringOfCOpyQ);
    this.base = this.base.find(jsonOfCopyQ);
    return this;
  }
}

module.exports = WhereClause;
