'use strict';
const sample={client:'示例客户（请替换）',project:'新品短视频拍摄与剪辑',days:'7',revisions:'2',deposit:'50',validity:'15',items:'需求沟通与脚本,1,600\n现场拍摄（半天）,1,1500\n短视频剪辑（60秒）,3,500',delivery:'3条60秒成片，1080×1920，MP4格式\n含2轮集中修改；新增拍摄及脚本重写另行报价'};
W.mount({...TOOL,demo:()=>Object.entries(sample).forEach(([k,v])=>W.set(k,v))});
W.add(W.row(W.field('client','客户名称','text',''),W.field('project','项目名称','text','')),W.field('items','报价明细','textarea','','每行：服务名称,数量,单价（人民币）；名称中不要使用逗号'),W.row(W.field('days','工期（自然日）','number','7'),W.field('revisions','包含修改次数','number','2')),W.row(W.field('deposit','首款比例（%）','number','50'),W.field('validity','报价有效期（天）','number','15')),W.field('delivery','交付规格与范围','textarea','','写清尺寸、格式、数量和额外收费边界'));
W.onRun(()=>{
  const d=W.data();if(!d.client||!d.project)throw Error('请填写客户和项目名称');
  const rows=d.items.split('\n').filter(s=>s.trim()).map((line,i)=>{const p=line.split(/[,，]/).map(s=>s.trim());if(p.length!==3||!p[0]||!Number.isFinite(+p[1])||!Number.isFinite(+p[2])||+p[1]<=0||+p[2]<0)throw Error('第'+(i+1)+'行格式不正确，请按“服务名称,数量,单价”填写');return [p[0],+p[1],+p[2],+p[1]*+p[2]];});
  if(!rows.length)throw Error('请添加至少一项报价');
  if(+d.deposit>100||+d.deposit<0||!Number.isFinite(+d.deposit)||!/^\d+$/.test(d.revisions)||!/^\d+$/.test(d.days)||+d.days<1||!/^\d+$/.test(d.validity)||+d.validity<1)throw Error('首款须为0—100%，工期和有效期为正整数，修改次数为非负整数');
  const total=rows.reduce((n,r)=>n+r[3],0), first=total*+d.deposit/100, money=n=>'¥'+n.toFixed(2);
  const text=`# ${d.project} · 报价与交付单\n客户：${d.client}\n出具日期：${new Date().toLocaleDateString('zh-CN')}\n报价有效期：${d.validity}天\n\n## 服务明细\n${rows.map(r=>'- '+r[0]+' × '+r[1]+'，单价'+money(r[2])+'，小计'+money(r[3])).join('\n')}\n\n## 金额与付款\n合计：${money(total)}\n首款（${d.deposit}%）：${money(first)}\n尾款：${money(total-first)}\n税费及开票口径：待双方确认\n\n## 交付与验收\n工期：资料齐备、首款到账并确认需求后${d.days}个自然日\n包含修改：${d.revisions}轮集中修改\n${d.delivery||'交付规格待确认'}\n\n## 确认清单\n- 客户已确认服务明细和交付规格\n- 双方已确认付款安排与税费口径\n- 双方已确认修改边界和交付日期\n- 验收联系人及反馈期限待确认`;
  const result=W.h('article',{class:'document'});result.append(W.h('h2',{text:d.project}),W.h('p',{text:'客户：'+d.client}),W.table(['服务','数量','单价','小计'],rows.map(r=>[r[0],r[1],money(r[2]),money(r[3])])));
  const stats=W.h('div',{class:'stats',style:'margin-top:20px'});[[money(total),'报价合计'],[money(first),'首款 '+d.deposit+'%'],[d.days+' 天','预计工期']].forEach(([n,l])=>stats.append(W.h('div',{class:'stat good'},[W.h('strong',{text:n}),W.h('span',{text:l})])));result.append(stats,W.h('h3',{text:'交付规格与修改边界'}),W.h('p',{text:d.delivery||'待双方确认',style:'white-space:pre-wrap'}),W.h('p',{text:'含'+d.revisions+'轮集中修改；报价有效期'+d.validity+'天。'}),W.h('div',{class:'warning',text:'税费、开票、起算时间和验收条件请在导出的完整文档中确认。'}));
  W.setResult(text,result);W.status('报价已计算，完整交付清单可编辑、打印和导出');
});
