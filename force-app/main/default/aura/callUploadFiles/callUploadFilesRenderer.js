({
    rerender : function () {
        this.superRerender();
        let evt = $A.get("e.force:navigateToComponent");
        evt.setParams({ componentDef: "c:uploadFiles"})
        evt.fire();
      }
})